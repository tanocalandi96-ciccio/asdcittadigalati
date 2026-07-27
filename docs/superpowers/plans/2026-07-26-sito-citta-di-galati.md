# Sito ASD Città di Galati — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sito vetrina Astro+Decap per ASD Città di Galati con hero scroll-driven (frame video su canvas) e cursore-pallone, deploy Netlify.

**Architecture:** Astro statico, contenuti in content collections editati via Decap CMS (git-gateway). Hero: sequenza WebP estratta dai video Seedance, scrub su canvas legato allo scroll. Dati campionato via iframe Tuttocampo con fallback. Zero framework JS runtime (vanilla TS nei componenti).

**Tech Stack:** Astro 5, TypeScript, Vitest (solo logica pura), Fontsource (Anton SC, Hanken Grotesk), Decap CMS, Netlify (Identity + git-gateway + Forms), ffmpeg (build asset).

## Global Constraints

- Lingua UI: italiano. Codice/identificatori: inglese.
- Palette e ruoli colore ESATTI da `DESIGN.md` (fonte: logo): bg `oklch(0.18 0.05 265)`, surface `oklch(0.22 0.05 265)`, text `oklch(0.97 0.005 265)`, giallo `oklch(0.92 0.19 105)`, blu `oklch(0.47 0.28 264)`, rosso `oklch(0.60 0.25 27)`, oro `oklch(0.68 0.16 55)`. Mai `#000`/`#fff` puri nei CSS del sito.
- Font: display Anton SC, body Hanken Grotesk, self-hosted via Fontsource. Vietati: Inter, Space Grotesk e ogni font della reflex-reject list impeccable.
- Divieti impeccable: niente border-left/right colorati >1px come accento, niente gradient text, niente glassmorphism, niente card grid identiche, niente em dash nei testi.
- Motion: ease-out-quart; tutto dietro `prefers-reduced-motion`. Cursore-pallone solo `(pointer: fine)`.
- Budget peso Home mobile primo load < 3,5 MB. Lighthouse mobile target: Perf ≥ 90, A11y ≥ 95.
- Squadra: Prima Categoria Sicilia 2026-27 (mai scrivere la categoria della stagione precedente). Campo: "Ducezio-Parafioriti", Galati Mamertino (ME). Tuttocampo squadra id 916584.
- Commit frequenti, messaggi in italiano, footer `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

---

### Task 1: Scaffold Astro + token di design

**Files:**
- Create: progetto Astro in root (`package.json`, `astro.config.mjs`, `tsconfig.json`, `src/styles/tokens.css`, `src/styles/global.css`)
- Modify: `.gitignore` (già esistente, verificare copra `node_modules/`, `dist/`, `.astro/`)

**Interfaces:**
- Produces: variabili CSS `--bg --surface --text --giallo --blu --rosso --oro`, classi font `.font-display`/`.font-body`, usate da tutti i task successivi.

- [ ] **Step 1: Scaffold**

```bash
npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict
npm install
npm install @fontsource/anton-sc @fontsource/hanken-grotesk
```

Nota: la cartella contiene già file (assets/, docs/, ...): se il wizard rifiuta, scaffoldare in `.tmp-astro` e spostare i file generati in root senza toccare le cartelle esistenti.

- [ ] **Step 2: Token CSS**

`src/styles/tokens.css`:

```css
:root {
  --bg: oklch(0.18 0.05 265);
  --surface: oklch(0.22 0.05 265);
  --text: oklch(0.97 0.005 265);
  --giallo: oklch(0.92 0.19 105);
  --blu: oklch(0.47 0.28 264);
  --rosso: oklch(0.6 0.25 27);
  --oro: oklch(0.68 0.16 55);
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --font-display: "Anton SC", sans-serif;
  --font-body: "Hanken Grotesk", sans-serif;
}
```

`src/styles/global.css`:

```css
@import "@fontsource/anton-sc/400.css";
@import "@fontsource/hanken-grotesk/400.css";
@import "@fontsource/hanken-grotesk/700.css";
@import "./tokens.css";

* { box-sizing: border-box; margin: 0; }
html { color-scheme: dark; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  line-height: 1.6;
}
h1, h2, h3 { font-family: var(--font-display); text-transform: uppercase; line-height: 1.05; }
img { max-width: 100%; display: block; }
:focus-visible { outline: 2px solid var(--giallo); outline-offset: 2px; }
```

- [ ] **Step 3: Verifica build**

Run: `npm run build`
Expected: exit 0, cartella `dist/` creata.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: scaffold Astro con token di design e font"
```

### Task 2: Layout base (header, nav, footer)

**Files:**
- Create: `src/layouts/Base.astro`, `src/components/Header.astro`, `src/components/Footer.astro`
- Modify: `src/pages/index.astro` (usa il layout)

**Interfaces:**
- Consumes: token CSS Task 1.
- Produces: `Base.astro` con props `{ title: string, description?: string }`, slot default. Nav con voci: Home `/`, Squadra `/squadra`, Stagione `/stagione`, News `/news`, Club `/club`, Contatti `/contatti`.

- [ ] **Step 1: Base.astro**

```astro
---
import "../styles/global.css";
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";
interface Props { title: string; description?: string }
const { title, description = "Sito ufficiale ASD Città di Galati" } = Astro.props;
---
<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} — ASD Città di Galati</title>
    <meta name="description" content={description} />
  </head>
  <body>
    <Header />
    <slot />
    <Footer />
  </body>
</html>
```

- [ ] **Step 2: Header.astro** — logo (assets copiato in `public/img/logo.png` ridimensionato 160px) + nav orizzontale, su mobile menu hamburger `<details>` senza JS. Link attivo sottolineato giallo (`aria-current="page"`).

```astro
---
const items = [
  ["/", "Home"], ["/squadra", "Squadra"], ["/stagione", "Stagione"],
  ["/news", "News"], ["/club", "Club"], ["/contatti", "Contatti"],
];
const path = Astro.url.pathname;
---
<header class="site-header">
  <a href="/" class="brand"><img src="/img/logo.png" alt="Stemma ASD Città di Galati" width="44" height="48" /><span>Città di Galati</span></a>
  <nav aria-label="principale">
    <ul>
      {items.map(([href, label]) => (
        <li><a href={href} aria-current={path === href ? "page" : undefined}>{label}</a></li>
      ))}
    </ul>
  </nav>
</header>
<style>
  .site-header { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem clamp(1rem, 4vw, 2.5rem); position: sticky; top: 0; background: var(--bg); z-index: 50; }
  .brand { display: flex; gap: 0.6rem; align-items: center; color: var(--text); text-decoration: none; font-family: var(--font-display); font-size: 1.15rem; }
  ul { display: flex; gap: 1.5rem; list-style: none; padding: 0; }
  a { color: var(--text); text-decoration: none; }
  a[aria-current="page"] { color: var(--giallo); }
  a:hover { color: var(--giallo); }
  @media (max-width: 720px) {
    ul { gap: 1rem; flex-wrap: wrap; }
  }
</style>
```

(Se il menu mobile a lista piena risulta affollato al controllo visivo, passare a `<details class="menu">` con la stessa lista dentro: decisione nel task, non rimandare.)

- [ ] **Step 3: Footer.astro** — dati societari placeholder marcati `<!-- DATI-SOCIETA -->` (arrivano dalla società), link social reali (Instagram `https://www.instagram.com/cittadigalati/`, Facebook `https://www.facebook.com/c1ttad1galat1/`), link privacy.

- [ ] **Step 4: index.astro placeholder**

```astro
---
import Base from "../layouts/Base.astro";
---
<Base title="Home">
  <main><h1>ASD Città di Galati</h1></main>
</Base>
```

- [ ] **Step 5: Verifica visiva**

Run: `npm run dev` + browser su `http://localhost:4321`.
Expected: header sticky, nav funzionante, font Anton SC sui titoli, fondo blu-notte.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: layout base con header, nav e footer"
```

### Task 3: Estrazione frame hero (script build asset)

**Files:**
- Create: `scripts/extract-hero-frames.mjs`, output in `public/hero-frames/desktop/` e `public/hero-frames/mobile/`
- Modify: `package.json` (script `frames`)

**Interfaces:**
- Consumes: `assets/hero-video-master-16x9.mp4`, `assets/hero-video-mobile-9x16.mp4`.
- Produces: `public/hero-frames/desktop/f-000.webp … f-069.webp` (70 frame, 1280w) e `public/hero-frames/mobile/f-000.webp … f-039.webp` (40 frame, 720w) + `public/hero-frames/manifest.json` `{ desktop: { count: 70, width: 1280, height: 720 }, mobile: { count: 40, width: 720, height: 1280 } }`.

- [ ] **Step 1: Script**

```js
// scripts/extract-hero-frames.mjs
import { execSync } from "node:child_process";
import { mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";

const jobs = [
  { src: "assets/hero-video-master-16x9.mp4", out: "public/hero-frames/desktop", frames: 70, scale: "1280:-2" },
  { src: "assets/hero-video-mobile-9x16.mp4", out: "public/hero-frames/mobile", frames: 40, scale: "720:-2" },
];

const manifest = {};
for (const { src, out, frames, scale } of jobs) {
  mkdirSync(out, { recursive: true });
  // durata → fps per ottenere il numero di frame voluto
  const dur = parseFloat(execSync(
    `ffprobe -v error -show_entries format=duration -of csv=p=0 "${src}"`
  ).toString());
  const fps = (frames / dur).toFixed(4);
  execSync(
    `ffmpeg -y -loglevel error -i "${src}" -vf "fps=${fps},scale=${scale}" -frames:v ${frames} -c:v libwebp -q:v 72 "${out}/f-%03d.webp"`,
    { stdio: "inherit" }
  );
  const files = readdirSync(out).filter(f => f.endsWith(".webp"));
  const bytes = files.reduce((s, f) => s + statSync(`${out}/${f}`).size, 0);
  const key = out.includes("desktop") ? "desktop" : "mobile";
  manifest[key] = { count: files.length, kb: Math.round(bytes / 1024) };
  console.log(`${key}: ${files.length} frame, ${Math.round(bytes / 1024)} KB`);
}
writeFileSync("public/hero-frames/manifest.json", JSON.stringify(manifest, null, 2));
```

Nota Windows: ffmpeg è nel PATH (già usato in sessione). I nomi ffmpeg partono da `f-001`: accettato, il componente userà indici 1-based dal manifest.

- [ ] **Step 2: Script npm**

In `package.json`: `"frames": "node scripts/extract-hero-frames.mjs"`.

- [ ] **Step 3: Esegui e verifica budget**

Run: `npm run frames`
Expected: stampa conteggi; mobile ≤ 3000 KB, desktop ≤ 6000 KB. Se sopra budget: abbassare `-q:v` a 65 e rieseguire.

- [ ] **Step 4: Controllo visivo frame**

Aprire `public/hero-frames/desktop/f-035.webp` e `mobile/f-020.webp`: nitidezza accettabile, niente banding pesante sul cielo.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: estrazione frame hero da video (script ffmpeg)"
```

### Task 4: Logica scrub (pura, con test) + componente Hero

**Files:**
- Create: `src/lib/scrub.ts`, `tests/scrub.test.ts`, `src/components/Hero.astro`
- Modify: `package.json` (vitest), `src/pages/index.astro`

**Interfaces:**
- Consumes: manifest + frame Task 3, token Task 1.
- Produces: `Hero.astro` autonomo (nessuna prop). `scrub.ts` esporta `frameIndex(scrollY: number, scrollRange: number, frameCount: number): number` e `lerp(current: number, target: number, alpha: number): number`.

- [ ] **Step 1: Vitest**

```bash
npm install -D vitest
```

`package.json`: `"test": "vitest run"`.

- [ ] **Step 2: Test failing**

```ts
// tests/scrub.test.ts
import { describe, it, expect } from "vitest";
import { frameIndex, lerp } from "../src/lib/scrub";

describe("frameIndex", () => {
  it("0 scroll → primo frame (1-based)", () => {
    expect(frameIndex(0, 1000, 70)).toBe(1);
  });
  it("fine range → ultimo frame", () => {
    expect(frameIndex(1000, 1000, 70)).toBe(70);
  });
  it("oltre il range resta sull'ultimo", () => {
    expect(frameIndex(1500, 1000, 70)).toBe(70);
  });
  it("scroll negativo resta sul primo", () => {
    expect(frameIndex(-50, 1000, 70)).toBe(1);
  });
  it("metà range → frame centrale", () => {
    expect(frameIndex(500, 1000, 70)).toBe(36);
  });
});

describe("lerp", () => {
  it("si avvicina al target", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });
  it("alpha 1 arriva subito", () => {
    expect(lerp(0, 10, 1)).toBe(10);
  });
});
```

- [ ] **Step 3: Run test → FAIL**

Run: `npm test`
Expected: FAIL, modulo `src/lib/scrub` inesistente.

- [ ] **Step 4: Implementazione**

```ts
// src/lib/scrub.ts
export function frameIndex(scrollY: number, scrollRange: number, frameCount: number): number {
  const t = Math.min(1, Math.max(0, scrollY / scrollRange));
  return Math.min(frameCount, Math.max(1, Math.round(1 + t * (frameCount - 1))));
}

export function lerp(current: number, target: number, alpha: number): number {
  return current + (target - current) * alpha;
}
```

- [ ] **Step 5: Run test → PASS**

Run: `npm test`
Expected: 7 passed.

- [ ] **Step 6: Hero.astro**

Struttura: sezione alta 250vh; dentro, contenitore sticky 100vh con canvas cover e overlay titolo. Script inline (vanilla TS):

```astro
---
// Hero scroll-driven: canvas + sequenza WebP, scrub con smoothing.
---
<section class="hero" id="hero">
  <div class="stage">
    <canvas id="hero-canvas" aria-hidden="true"></canvas>
    <img id="hero-fallback" src="/hero-frames/desktop/f-070.webp" alt="Stemma ASD Città di Galati che si compone sul campo del Ducezio-Parafioriti" />
    <div class="overlay" id="hero-overlay">
      <h1>ASD Città<br />di Galati</h1>
      <a class="cta" href="/stagione">La stagione</a>
    </div>
  </div>
</section>
<style>
  .hero { height: 250vh; }
  .stage { position: sticky; top: 0; height: 100vh; overflow: hidden; }
  canvas, #hero-fallback { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  canvas { display: none; }
  .overlay { position: absolute; inset: auto 0 12vh 0; text-align: center; opacity: 0; transform: translateY(16px); transition: opacity 0.6s var(--ease-out-quart), transform 0.6s var(--ease-out-quart); }
  .overlay.on { opacity: 1; transform: none; }
  .overlay h1 { font-size: clamp(3rem, 9vw, 7rem); text-shadow: 0 2px 24px oklch(0.1 0.04 265 / 0.8); }
  .cta { display: inline-block; margin-top: 1rem; padding: 0.8rem 2rem; background: var(--giallo); color: oklch(0.2 0.05 265); font-family: var(--font-display); text-decoration: none; font-size: 1.1rem; }
  @media (prefers-reduced-motion: reduce) { .hero { height: 100vh; } .overlay { opacity: 1; transform: none; } }
</style>
<script>
  import { frameIndex, lerp } from "../lib/scrub";

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("hero-canvas") as HTMLCanvasElement;
  const fallback = document.getElementById("hero-fallback") as HTMLImageElement;
  const overlay = document.getElementById("hero-overlay")!;

  if (reduced) {
    overlay.classList.add("on");
  } else {
    init();
  }

  async function init() {
    const portrait = matchMedia("(max-width: 720px)").matches;
    const dir = portrait ? "mobile" : "desktop";
    const manifest = await fetch("/hero-frames/manifest.json").then(r => r.json());
    const count = manifest[dir].count;
    fallback.src = `/hero-frames/${dir}/f-${String(count).padStart(3, "0")}.webp`;

    const frames: HTMLImageElement[] = new Array(count + 1);
    const load = (i: number) => new Promise<void>(res => {
      const img = new Image();
      img.onload = () => { frames[i] = img; res(); };
      img.onerror = () => res();
      img.src = `/hero-frames/${dir}/f-${String(i).padStart(3, "0")}.webp`;
    });

    await Promise.all(Array.from({ length: 10 }, (_, k) => load(k + 1)));
    canvas.style.display = "block";
    fallback.style.display = "none";
    for (let i = 11; i <= count; i++) load(i); // resto in background

    const ctx = canvas.getContext("2d")!;
    let target = 1, current = 1, raf = 0;

    function draw() {
      current = lerp(current, target, 0.18);
      const idx = Math.round(current);
      const img = frames[idx] ?? frames[1];
      if (img) {
        const { width: cw, height: ch } = canvas;
        const s = Math.max(cw / img.width, ch / img.height);
        const w = img.width * s, h = img.height * s;
        ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      }
      overlay.classList.toggle("on", target >= count - 2);
      if (Math.abs(current - target) > 0.05) raf = requestAnimationFrame(draw);
      else raf = 0;
    }

    function onScroll() {
      const range = (document.getElementById("hero")!.offsetHeight) - innerHeight;
      target = frameIndex(scrollY, range, count);
      if (!raf) raf = requestAnimationFrame(draw);
    }

    function resize() {
      canvas.width = innerWidth * devicePixelRatio;
      canvas.height = innerHeight * devicePixelRatio;
      if (!raf) raf = requestAnimationFrame(draw);
    }

    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", resize);
    resize(); onScroll();
  }
</script>
```

- [ ] **Step 7: Integrazione in index**

`src/pages/index.astro`: `<Hero />` come primo blocco del `<main>` (main senza padding top per il full-bleed).

- [ ] **Step 8: Verifica browser**

Dev server: scroll → logo si assembla, overlay entra alla fine; viewport mobile (devtools) usa il set 9:16; con reduced-motion (emulato) si vede solo il frame finale statico. Nessun errore console.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: hero scroll-driven con canvas e test sulla logica di scrub"
```

### Task 5: Cursore-pallone

**Files:**
- Create: `src/components/BallCursor.astro` (SVG inline + script)
- Modify: `src/layouts/Base.astro` (monta il componente prima di `</body>`)

**Interfaces:**
- Consumes: token colore.
- Produces: nessuna API; attivo solo `(pointer: fine)` e non reduced-motion.

- [ ] **Step 1: Componente**

SVG pallone 36px: cerchio con spicchi (pentagono centrale nero, spicchi giallo/blu/rosso, contorno oro), costruito con `<path>` espliciti. Script: segue il mouse via transform (translate + rotate cumulativo dal delta X), scala 1.8 su `a, button, [role="button"], input, summary` via `mouseover/mouseout` con `closest()`. Body: `cursor: none` applicato SOLO da JS quando attivo (classe `ball-cursor-on`).

```astro
<div id="ball-cursor" aria-hidden="true">
  <svg viewBox="0 0 36 36" width="36" height="36">
    <circle cx="18" cy="18" r="16.5" fill="oklch(0.97 0.005 265)" stroke="var(--oro)" stroke-width="1.5"/>
    <path d="M18 11 l6.5 4.7 -2.5 7.6 -8 0 -2.5 -7.6 Z" fill="oklch(0.2 0.03 265)"/>
    <path d="M18 2 a16 16 0 0 1 10 3.6 l-4 5.4 -6 -2 Z" fill="var(--giallo)"/>
    <path d="M4.5 8.5 a16 16 0 0 1 7.5 -5.8 l2.5 6.5 -5.5 4.5 Z" fill="var(--blu)"/>
    <path d="M31.5 12 a16 16 0 0 1 2 9 l-7 -0.5 -1.5 -6 Z" fill="var(--rosso)"/>
    <path d="M2.6 21 a16 16 0 0 0 4.4 8.6 l4.5 -5 -2.5 -5.6 Z" fill="var(--rosso)"/>
    <path d="M25 28.5 a16 16 0 0 1 -8.5 5 l-0.5 -6.5 6 -2.5 Z" fill="var(--blu)"/>
  </svg>
</div>
<style>
  #ball-cursor { position: fixed; left: 0; top: 0; z-index: 9999; pointer-events: none; display: none; will-change: transform; filter: drop-shadow(0 2px 6px oklch(0.1 0.04 265 / 0.5)); }
  :global(body.ball-cursor-on), :global(body.ball-cursor-on a), :global(body.ball-cursor-on button) { cursor: none; }
</style>
<script>
  const fine = matchMedia("(pointer: fine)").matches;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (fine && !reduced) {
    const el = document.getElementById("ball-cursor")!;
    document.body.classList.add("ball-cursor-on");
    el.style.display = "block";
    let rot = 0, lastX = 0, scale = 1;
    addEventListener("mousemove", (e) => {
      rot += (e.clientX - lastX) * 0.55;
      lastX = e.clientX;
      el.style.transform = `translate(${e.clientX - 18}px, ${e.clientY - 18}px) rotate(${rot}deg) scale(${scale})`;
    }, { passive: true });
    const interactive = (t: EventTarget | null) =>
      t instanceof Element && t.closest("a, button, [role='button'], input, textarea, summary");
    addEventListener("mouseover", (e) => { if (interactive(e.target)) scale = 1.8; });
    addEventListener("mouseout", (e) => { if (interactive(e.target)) scale = 1; });
  }
</script>
```

- [ ] **Step 2: Verifica browser**

Desktop: pallone segue e ruota, si ingrandisce su nav e CTA; devtools emulazione touch → cursore normale, pallone assente; reduced-motion → assente.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: cursore-pallone nei colori del logo"
```

### Task 6: Content collections + contenuti seed

**Files:**
- Create: `src/content.config.ts`, `src/content/news/benvenuti.md`, `src/content/giocatori/esempio-giocatore.md`, `src/content/sponsor/esempio-sponsor.md`, `src/content/staff/esempio-staff.md`

**Interfaces:**
- Produces: collezioni tipate `news { title, date, cover?, body }`, `giocatori { nome, ruolo: "Portiere"|"Difensore"|"Centrocampista"|"Attaccante", numero?, foto? }`, `staff { nome, incarico, foto?, ordine }`, `sponsor { nome, livello: "main"|"tecnico"|"partner", logo, url? }`. I task 7-8 le consumano via `getCollection`.

- [ ] **Step 1: Schema**

```ts
// src/content.config.ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const news = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/news" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    cover: z.string().optional(),
  }),
});
const giocatori = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/giocatori" }),
  schema: z.object({
    nome: z.string(),
    ruolo: z.enum(["Portiere", "Difensore", "Centrocampista", "Attaccante"]),
    numero: z.number().int().optional(),
    foto: z.string().optional(),
  }),
});
const staff = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/staff" }),
  schema: z.object({
    nome: z.string(),
    incarico: z.string(),
    foto: z.string().optional(),
    ordine: z.number().int().default(99),
  }),
});
const sponsor = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/sponsor" }),
  schema: z.object({
    nome: z.string(),
    livello: z.enum(["main", "tecnico", "partner"]),
    logo: z.string(),
    url: z.string().url().optional(),
  }),
});
export const collections = { news, giocatori, staff, sponsor };
```

- [ ] **Step 2: Seed** — un file reale per collezione (news di benvenuto scritta in tono da PRODUCT.md; giocatore/staff/sponsor con dati segnaposto dichiarati, foto assente per testare la silhouette).

- [ ] **Step 3: Verifica**

Run: `npm run build`
Expected: exit 0, nessun errore di schema.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: content collections con contenuti seed"
```

### Task 7: Home completa

**Files:**
- Create: `src/components/NewsCard.astro`, `src/components/SponsorStrip.astro`, `src/components/NextMatch.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: collezioni Task 6, Hero Task 4.
- Produces: `NewsCard { post }`, `SponsorStrip` (autonomo, legge collezione), `NextMatch` (autonomo, iframe Tuttocampo prossima partita con fallback).

- [ ] **Step 1: Sezioni home** — sotto l'Hero: (a) ultime 3 news, griglia asimmetrica: prima card doppia (`grid-column: span 2` da 720px in su), foto full-bleed con titolo sovrapposto su gradiente blu-notte, data in giallo; (b) `NextMatch`: contenitore con titolo proprio "Prossima partita" + iframe Tuttocampo widget partita (src configurato in `src/lib/tuttocampo.ts` con costanti `TEAM_ID = "916584"` e URL widget placeholder documentato: si genera dall'account Tuttocampo, TODO tracciato in HANDOFF, non nel codice) + fallback `<p>` con link `https://www.tuttocampo.it/Sicilia/PrimaCategoria/.../Squadra/CittaDiGalati/916584/Scheda` visibile se l'iframe non carica (timeout JS 4s → classe `.widget-failed`); (c) `SponsorStrip`: loghi in scala di grigi (`filter: grayscale(1)` → colore su hover), main più grandi, su fondo chiaro `oklch(0.95 0.01 265)`.
- [ ] **Step 2: Verifica browser** — mobile 375px e desktop 1280px: gerarchia leggibile, nessun overflow orizzontale, sponsor visibili, fallback widget mostrato (il widget vero non è ancora configurato).
- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: home con news, prossima partita e sponsor"
```

### Task 8: Pagine Squadra, News, Club, Contatti

**Files:**
- Create: `src/pages/squadra.astro`, `src/pages/news/index.astro`, `src/pages/news/[slug].astro`, `src/pages/club.astro`, `src/pages/contatti.astro`, `src/components/PlayerCard.astro`, `public/img/silhouette.svg`

**Interfaces:**
- Consumes: collezioni, layout, token.
- Produces: rotte pubbliche definitive.

- [ ] **Step 1: Squadra** — giocatori raggruppati per ruolo (ordine: Portieri, Difensori, Centrocampisti, Attaccanti), `PlayerCard` con foto o `silhouette.svg` (sagoma su fondo surface con bordo oro 1px), numero grande Anton SC; staff sotto, ordinato per `ordine`.
- [ ] **Step 2: News** — indice con la stessa griglia asimmetrica della home (riuso `NewsCard`); dettaglio `[slug].astro` con `getStaticPaths`, cover full-bleed, corpo max 70ch centrato.
- [ ] **Step 3: Club** — storia (testo segnaposto marcato), sezione campo: nome "Ducezio-Parafioriti", indirizzo, mappa `<iframe>` OpenStreetMap embed con `loading="lazy"` e link esterno "Apri in Google Maps".
- [ ] **Step 4: Contatti** — form Netlify (`name="contatti"`, `data-netlify="true"`, honeypot `netlify-honeypot="bot-field"`), campi nome/email/messaggio con label visibili; dati societari da footer.
- [ ] **Step 5: Verifica** — `npm run build` exit 0; click su tutte le rotte dal nav in dev; form mostra i campi con label; silhouette visibile per il giocatore senza foto.
- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: pagine squadra, news, club e contatti"
```

### Task 9: Pagina Stagione (widget Tuttocampo)

**Files:**
- Create: `src/pages/stagione.astro`, `src/components/TuttocampoWidget.astro`, `src/lib/tuttocampo.ts`

**Interfaces:**
- Consumes: layout, token.
- Produces: `TuttocampoWidget { type: "classifica" | "risultati" | "calendario", title: string }` riusato anche da `NextMatch`.

- [ ] **Step 1: Modulo config**

```ts
// src/lib/tuttocampo.ts
export const TEAM_ID = "916584";
export const TEAM_PAGE = "https://www.tuttocampo.it/Sicilia/PrimaCategoria/GironeD/Squadra/CittaDiGalati/916584/Scheda";
// NOTA: URL widget per girone Prima Categoria 2026-27 da generare dall'account
// Tuttocampo quando la FIGC pubblica i gironi. Fino ad allora WIDGET_URLS resta vuoto
// e i componenti mostrano il fallback.
export const WIDGET_URLS: Partial<Record<"classifica" | "risultati" | "calendario", string>> = {};
```

- [ ] **Step 2: Componente** — se `WIDGET_URLS[type]` assente → blocco "Classifica in aggiornamento: i gironi 2026-27 non sono ancora stati pubblicati" + link `TEAM_PAGE`; se presente → iframe `loading="lazy"` con `title` descrittivo e stesso fallback su errore (timeout 4s).
- [ ] **Step 3: Pagina** — tre sezioni (Classifica, Risultati, Calendario) con i tre widget.
- [ ] **Step 4: Verifica** — pagina renderizza i tre fallback con link funzionanti; nessun errore console.
- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: pagina stagione con widget Tuttocampo e fallback"
```

### Task 10: Decap CMS

**Files:**
- Create: `public/admin/index.html`, `public/admin/config.yml`
- Modify: `src/layouts/Base.astro` (script Netlify Identity solo su /admin non serve: lo script va in admin/index.html)

**Interfaces:**
- Consumes: schema collezioni Task 6 (config.yml DEVE rispecchiarlo campo per campo).
- Produces: pannello `/admin` funzionante su Netlify (Identity + git-gateway).

- [ ] **Step 1: index.html admin**

```html
<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>Gestione contenuti — Città di Galati</title>
  <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
</head>
<body>
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
</body>
</html>
```

- [ ] **Step 2: config.yml** — backend git-gateway branch main; media in `public/img/uploads`; collezioni news/giocatori/staff/sponsor con gli stessi campi e enum dello schema (etichette in italiano: "Titolo", "Data", "Copertina"...).
- [ ] **Step 3: Verifica locale** — `npx decap-server` + `local_backend: true` temporaneo: creare una news di prova dal pannello, verificare file md scritto correttamente, poi rimuovere la news di prova e il flag local_backend prima del commit (il flag resta documentato in commento).
- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: pannello Decap CMS per news, rosa, staff e sponsor"
```

### Task 11: SEO, privacy, rifinitura a11y

**Files:**
- Create: `src/pages/privacy.astro`, `public/favicon.svg` (dallo stemma), `src/components/CookieNotice.astro`
- Modify: `src/layouts/Base.astro` (OG tags, favicon, CookieNotice), `src/components/Footer.astro` (link privacy)

**Interfaces:**
- Produces: meta OG con immagine `assets/hero-frame-test.png` ridotta a `public/img/og.jpg` (1200×630), privacy policy, banner cookie minimale.

- [ ] **Step 1: Meta** — `og:title`, `og:description`, `og:image`, `twitter:card` in Base.astro; favicon SVG dallo stemma (cerchio semplificato nei 3 colori, non il logo intero illeggibile a 16px).
- [ ] **Step 2: Privacy + cookie** — pagina privacy con sezioni: titolare (placeholder marcato DATI-SOCIETA), dati form contatti (Netlify), cookie di terze parti (Tuttocampo iframe, eventuali embed social). `CookieNotice`: banner in basso, testo breve, bottone "Ho capito" (localStorage), link privacy. Niente cookie di profilazione nostri → banner informativo, non blocking wall.
- [ ] **Step 3: Pass a11y** — axe devtools sulla home + squadra: contrasti, alt text, heading order, landmark. Fix ciò che emerge.
- [ ] **Step 4: Verifica** — `npm run build`; controllo manuale tab-order sulla home (hero non intrappola il focus).
- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: seo, privacy, cookie notice e rifinitura accessibilità"
```

### Task 12: Verifica finale impeccable + Lighthouse + deploy config

**Files:**
- Create: `netlify.toml`, `docs/HANDOFF.md`
- Modify: eventuali fix da audit

**Interfaces:**
- Consumes: tutto.
- Produces: sito pronto per deploy Netlify + documento di consegna.

- [ ] **Step 1: netlify.toml**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/hero-frames/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

- [ ] **Step 2: Lighthouse** — `npm run build && npm run preview`, Lighthouse mobile sulla home. Target: Perf ≥ 90, A11y ≥ 95. Se Perf < 90: primo sospetto peso frame → ridurre frame mobile a 30 o qualità a 65, rieseguire.
- [ ] **Step 3: Audit impeccable** — passata `audit` + `critique` della skill impeccable su home, squadra, stagione: divieti rispettati (niente side-stripe, gradient text, card identiche), register brand onorato (hero = momento wow, resto sobrio). Fix inline.
- [ ] **Step 4: HANDOFF.md** — cosa serve dalla società (dati legali, sponsor, rosa, foto, liberatorie, dominio), come si configura il widget Tuttocampo a gironi pubblicati (passo-passo con screenshot testuale), come si usa /admin, come si fa il deploy Netlify (collegamento repo, Identity, git-gateway, invito utente dirigente).
- [ ] **Step 5: Commit finale**

```bash
git add -A
git commit -m "feat: config deploy Netlify, audit finale e documento di consegna"
```

---

## Self-review (fatta)

- Copertura spec: pagine ✓, hero ✓ (Task 3-4), cursore ✓ (5), CMS ✓ (6, 10), widget+fallback ✓ (7, 9), errori/edge ✓ (7-9, 11), verifica ✓ (12), materiali società → HANDOFF ✓.
- Segnaposto: nessun TBD; i placeholder contenuti (DATI-SOCIETA) sono deliberati e tracciati in HANDOFF.
- Coerenza interfacce: `frameIndex/lerp` coerenti tra test e Hero; `WIDGET_URLS`/`TEAM_PAGE` usati da NextMatch e TuttocampoWidget; collezioni Task 6 = config.yml Task 10.
- Nota deploy: test Netlify Forms e Identity possibili solo su Netlify reale → verificati in fase deploy (fuori piano, sezione HANDOFF).
