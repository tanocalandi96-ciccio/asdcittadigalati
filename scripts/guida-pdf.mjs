// Genera il PDF della guida al pannello, partendo da docs/GUIDA-PANNELLO.md.
//
// Perche' passare da HTML e Chrome invece di comporre il PDF a blocchi: la
// guida va in mano a un volontario, quindi conta che sia leggibile. Con HTML
// si controllano tipografia, spaziature e colori sociali; Chrome stampa la
// stessa resa che si vedrebbe a schermo.
//
// Uso: node scripts/guida-pdf.mjs   (oppure `npm run guida-pdf`)
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";

const SORGENTE = "docs/GUIDA-PANNELLO.md";
const USCITA = "docs/Guida-pannello-Citta-di-Galati.pdf";

const CHROME = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].find((p) => existsSync(p));

if (!CHROME) {
  console.error("Nessun browser trovato per la stampa. Serve Chrome o Edge.");
  process.exit(1);
}

// Conversione markdown -> HTML: la guida usa una manciata di costrutti
// (titoli, elenchi, grassetto, citazioni, righe orizzontali), quindi bastano
// poche regole invece di una libreria intera.
function markdownToHtml(md) {
  const escape = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const inline = (s) =>
    escape(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/\[(.+?)\]\((.+?)\)/g, "<a href=\"$2\">$1</a>");

  const out = [];
  let lista = null; // "ul" | "ol" al primo livello
  let annidata = null; // "ul" | "ol" dentro l'elemento corrente
  let paragrafo = []; // righe da unire: nel markdown il testo va a capo, in
  //                     pagina deve restare un paragrafo solo
  let citazione = [];

  const chiudiParagrafo = () => {
    if (paragrafo.length) {
      out.push(`<p>${inline(paragrafo.join(" "))}</p>`);
      paragrafo = [];
    }
  };
  const chiudiAnnidata = () => {
    if (annidata) {
      out.push(`</${annidata}>`);
      annidata = null;
    }
  };
  const chiudiLista = () => {
    chiudiAnnidata();
    if (lista) {
      out.push(`</${lista}>`);
      lista = null;
    }
  };
  const chiudiCitazione = () => {
    if (citazione.length) {
      out.push(`<blockquote>${inline(citazione.join(" "))}</blockquote>`);
      citazione = [];
    }
  };
  const chiudiTutto = () => {
    chiudiParagrafo();
    chiudiCitazione();
    chiudiLista();
  };

  for (const riga of md.split(/\r?\n/)) {
    const t = riga.trim();
    const indentata = /^\s{2,}/.test(riga);

    if (t.startsWith(">")) {
      chiudiParagrafo();
      chiudiLista();
      citazione.push(t.replace(/^>\s?/, ""));
      continue;
    }
    chiudiCitazione();

    if (!t) {
      chiudiTutto();
      continue;
    }
    if (t === "---") {
      chiudiTutto();
      out.push("<hr />");
      continue;
    }

    const titolo = t.match(/^(#{1,4})\s+(.*)$/);
    if (titolo) {
      chiudiTutto();
      const n = titolo[1].length;
      out.push(`<h${n}>${inline(titolo[2])}</h${n}>`);
      continue;
    }

    const numerata = t.match(/^\d+\.\s+(.*)$/);
    const puntata = t.match(/^[-*]\s+(.*)$/);

    if (numerata || puntata) {
      chiudiParagrafo();
      const tipo = numerata ? "ol" : "ul";
      const testo = inline((numerata || puntata)[1]);

      // Elenco rientrato: sta dentro l'elemento appena aperto, non e' un
      // elenco nuovo. Senza questo la numerazione principale ripartirebbe
      // da 1 dopo ogni elenco puntato interno.
      if (indentata && lista) {
        if (annidata !== tipo) {
          chiudiAnnidata();
          out.push(`<${tipo} class="annidata">`);
          annidata = tipo;
        }
        out.push(`<li>${testo}</li>`);
        continue;
      }

      chiudiAnnidata();
      if (lista !== tipo) {
        chiudiLista();
        out.push(`<${tipo}>`);
        lista = tipo;
      }
      out.push(`<li>${testo}</li>`);
      continue;
    }

    // riga rientrata sotto un elemento: ne e' la continuazione
    if (lista && indentata) {
      const ultimo = out.length - 1;
      out[ultimo] = out[ultimo].replace(/<\/li>$/, ` ${inline(t)}</li>`);
      continue;
    }

    chiudiLista();
    paragrafo.push(t);
  }
  chiudiTutto();
  return out.join("\n");
}

const corpo = markdownToHtml(readFileSync(SORGENTE, "utf8"));

const html = `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><title>Guida al pannello</title>
<style>
  @page { size: A4; margin: 18mm 16mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", system-ui, sans-serif;
    font-size: 10.5pt;
    line-height: 1.55;
    color: #16181f;
    margin: 0;
  }
  h1 {
    font-size: 22pt;
    margin: 0 0 2mm;
    color: #12203f;
    letter-spacing: -0.01em;
  }
  h1 + p { color: #55596a; margin-top: 0; }
  h2 {
    font-size: 14pt;
    margin: 9mm 0 2mm;
    padding-bottom: 1.5mm;
    border-bottom: 2px solid #e8b21f;
    color: #12203f;
    page-break-after: avoid;
  }
  h3 { font-size: 11.5pt; margin: 5mm 0 1mm; color: #12203f; page-break-after: avoid; }
  p { margin: 0 0 2.5mm; }
  ul, ol { margin: 0 0 3mm; padding-left: 6mm; }
  li { margin-bottom: 1.5mm; }
  .annidata { margin: 1.5mm 0 2mm; padding-left: 5mm; }
  code {
    background: #f1f2f5;
    padding: 0.4mm 1.2mm;
    border-radius: 2px;
    font-family: Consolas, monospace;
    font-size: 9.5pt;
  }
  a { color: #12203f; }
  hr { border: none; border-top: 1px solid #dcdee5; margin: 6mm 0; }
  blockquote {
    margin: 3mm 0;
    padding: 3mm 4mm;
    background: #fdf6e0;
    border-radius: 3px;
    font-size: 10pt;
  }
  strong { color: #0d1730; }
  .intestazione {
    display: flex;
    align-items: center;
    gap: 4mm;
    padding-bottom: 4mm;
    margin-bottom: 6mm;
    border-bottom: 3px solid #12203f;
  }
  .intestazione img { height: 20mm; width: auto; }
  .intestazione .club {
    font-size: 12pt;
    font-weight: 700;
    color: #12203f;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .intestazione .sotto { font-size: 9.5pt; color: #55596a; }
  footer {
    margin-top: 8mm;
    padding-top: 3mm;
    border-top: 1px solid #dcdee5;
    font-size: 8.5pt;
    color: #7a7e8c;
  }
</style></head>
<body>
  <div class="intestazione">
    <img src="LOGO_DATA" alt="" />
    <div>
      <div class="club">A.S.D. Città di Galati</div>
      <div class="sotto">Guida per chi aggiorna il sito</div>
    </div>
  </div>
  ${corpo}
  <footer>
    Documento generato per l'ASD Città di Galati. In caso di dubbi, contattare
    chi ha realizzato il sito prima di modificare qualcosa di cui non si è sicuri.
  </footer>
</body></html>`;

// Il logo va incorporato: un PDF che punta a un file esterno mostrerebbe un
// riquadro vuoto una volta spostato altrove.
const logo = readFileSync("public/img/logo.png").toString("base64");
const htmlFinale = html.replace("LOGO_DATA", `data:image/png;base64,${logo}`);

const tmp = join(tmpdir(), `guida-${Date.now()}`);
mkdirSync(tmp, { recursive: true });
const fileHtml = join(tmp, "guida.html");
writeFileSync(fileHtml, htmlFinale, "utf8");

// Chrome vuole un percorso assoluto: con uno relativo scrive il PDF nella
// propria cartella di lavoro, o non lo scrive affatto, senza segnalare errori.
const uscitaAssoluta = resolve(USCITA);

execFileSync(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--print-to-pdf=${uscitaAssoluta}`,
    `file:///${fileHtml.replace(/\\/g, "/")}`,
  ],
  { stdio: "pipe" }
);

if (!existsSync(uscitaAssoluta)) {
  console.error("Chrome non ha prodotto il PDF.");
  process.exit(1);
}

rmSync(tmp, { recursive: true, force: true });
console.log(`PDF scritto in ${USCITA}`);
