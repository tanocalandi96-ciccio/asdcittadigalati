// scripts/extract-hero-frames.mjs
// Estrae le sequenze di frame WebP per l'hero scroll-driven (Task 4) dai due
// video sorgente (desktop 16:9 e mobile 9:16), rispettando il budget di peso.
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// La coda del video sorgente viene scartata: dal fotogramma ~99 (4,08s) in poi
// lo stemma e' fermo ma Seedance rimette in movimento le nuvole, che per tutto
// il centro erano immobili. Su uno scrub a scatti quel risveglio si legge come
// uno stacco brusco del cielo. Misurato su una zona di cielo senza frammenti:
// differenza media fra fotogrammi 0,1-0,2 al centro contro 0,4-0,6 in coda.
const USE_SECONDS = 4.08;

// Risoluzione dei frame: il master e' 1920x1080, estrarre a 1280 significava
// buttare meta' dei pixel e poi farli reingrandire dal canvas (fattore ~1,9 su
// uno schermo desktop pieno, da cui l'immagine molle). Si estrae alla
// risoluzione nativa. Sul mobile 900px coprono anche i telefoni a dPR 3.
// Solo desktop: la sequenza mobile la costruisce scripts/build-mobile-hero.py,
// perche' il video 9:16 e' un reframe generato dall'AI e ha bisogno di una
// correzione (congelamento dello sfondo dopo il gradino) che qui non si puo'
// fare. `npm run frames` lancia entrambi.
const jobs = [
  { key: "desktop", src: "assets/hero-video-master-16x9.mp4", out: "public/hero-frames/desktop", frames: 70, scale: "1920:-2" },
];

// Budget di peso per set (KB). Il mobile resta stretto: e' quello che pesa sul
// 4G. Il desktop puo' respirare perche' solo i primi 10 frame bloccano la
// comparsa dell'hero, il resto della sequenza arriva in sottofondo.
const BUDGET_KB = { desktop: 8500, mobile: 2800 };
// Tentativi di qualità WebP in ordine decrescente: si ferma al primo che rientra nel budget.
const QUALITY_ATTEMPTS = [72, 65, 58, 50];

// Si riparte dal manifest esistente: la voce "mobile" la scrive
// scripts/build-mobile-hero.py e non va persa.
const manifest = existsSync("public/hero-frames/manifest.json")
  ? JSON.parse(readFileSync("public/hero-frames/manifest.json", "utf8"))
  : {};

for (const { key, src, out, frames, scale } of jobs) {
  if (existsSync(out)) rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  const dur = Math.min(
    USE_SECONDS,
    parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${src}"`).toString())
  );
  // durata utile -> fps per ottenere esattamente il numero di frame voluto
  const fps = (frames / dur).toFixed(4);

  let totalKb = 0;
  let usedQuality = null;
  let files = [];

  for (const q of QUALITY_ATTEMPTS) {
    execSync(
      `ffmpeg -y -loglevel error -t ${dur} -i "${src}" -vf "fps=${fps},scale=${scale}" -frames:v ${frames} -start_number 0 -c:v libwebp -q:v ${q} "${out}/f-%03d.webp"`,
      { stdio: "inherit" }
    );
    files = readdirSync(out).filter((f) => f.endsWith(".webp")).sort();
    const bytes = files.reduce((s, f) => s + statSync(join(out, f)).size, 0);
    totalKb = Math.round(bytes / 1024);
    usedQuality = q;
    console.log(`${key}: q:v=${q} -> ${files.length} frame, ${totalKb} KB`);
    if (totalKb <= BUDGET_KB[key]) break;
    console.log(`${key}: supera il budget di ${BUDGET_KB[key]} KB, riprovo con qualita' inferiore...`);
  }

  if (totalKb > BUDGET_KB[key]) {
    console.warn(
      `ATTENZIONE: ${key} resta sopra budget (${totalKb} KB > ${BUDGET_KB[key]} KB) anche alla qualita' minima testata (q:v=${usedQuality}).`
    );
    process.exitCode = 1;
  }

  if (files.length !== frames) {
    throw new Error(`${key}: attesi ${frames} frame, trovati ${files.length}`);
  }

  // dimensioni reali del frame generato (verifica indipendente dal calcolo dello scale filter)
  const probe = execSync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${join(out, files[0])}"`
  )
    .toString()
    .trim();
  const [width, height] = probe.split(",").map(Number);

  manifest[key] = { count: files.length, width, height, kb: totalKb };
  console.log(
    `${key}: FINALE ${files.length} frame, ${width}x${height}, qualita'=${usedQuality}, ${totalKb} KB (budget ${BUDGET_KB[key]} KB)`
  );
}

writeFileSync("public/hero-frames/manifest.json", JSON.stringify(manifest, null, 2));
console.log("Manifest scritto in public/hero-frames/manifest.json");
