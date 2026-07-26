# Design

Sistema visivo del sito ASD Città di Galati. Fonte di verità per colori, tipografia, componenti. I valori colore derivano dal campionamento del logo (`assets/logo-original.jpeg`).

## Color Palette

Strategia: **Committed** — il blu-notte da stadio carica la scena; giallo/blu/rosso del logo usati come ruoli precisi, mai decorazione casuale.

I colori del logo sono puri e molto saturi (RGB pieni). Per l'uso a schermo si convertono in OKLCH moderando il chroma sui fondi e tenendolo pieno sugli accenti piccoli.

### Ruoli

- `--bg`: blu notte stadio `oklch(0.18 0.05 265)` — fondo dominante del sito (dal cielo dell'hero, non nero puro).
- `--surface`: `oklch(0.22 0.05 265)` — superfici sopraelevate.
- `--text`: `oklch(0.97 0.005 265)` — mai bianco puro.
- `--giallo`: `oklch(0.92 0.19 105)` (≈ #F8F000 del logo) — accento primario: CTA, evidenziazioni, punteggi.
- `--blu`: `oklch(0.47 0.28 264)` (≈ #0106FF) — link, elementi interattivi su fondo chiaro.
- `--rosso`: `oklch(0.60 0.25 27)` (≈ #FE0000) — solo momenti forti: risultati live, badge sconfitta/vittoria, mai testo lungo.
- `--oro`: `oklch(0.68 0.16 55)` (≈ #F87800) — dettagli premium: bordi sottili, riflessi, hover; eredita dal bordo dello stemma.

Regole: giallo su blu-notte = combinazione firma (come le strisce del logo). Rosso mai sopra blu saturo (vibrazione). Su sezioni chiare (foto, sponsor) il testo torna blu-notte.

## Typography

Voce del brand in tre parole fisiche: **orgoglioso, ruvido, spettacolare** (manifesto da stadio, gagliardetto, non brochure).

- **Display / titoli**: **Anton SC** (self-hosted via Fontsource) — condensato pesante da manifesto sportivo. Maiuscolo per titoli di sezione. Scala aggressiva: hero > 3rem mobile, ratio ≥ 1.3 tra i livelli.
- **Testo**: **Hanken Grotesk**, max 70ch, corpo 1rem/1.6.
- Numeri (risultati, minuti, classifica): tabular-nums.

## Componenti chiave

- **Hero scroll-driven**: canvas full-viewport, sequenza frame dal video (16:9 desktop, 9:16 mobile), scrub legato allo scroll con easing; overlay titolo + CTA che entrano a fine assemblaggio. Reduced-motion / JS assente → frame finale statico.
- **Cursore-pallone** (solo `pointer: fine`): SVG pallone con spicchi nei colori logo (giallo/blu/rosso, cuciture nere, riflesso oro), ruota col movimento, scala 1.8× su elementi interattivi. `cursor: none` solo quando attivo.
- **Card partita**: avversario, data, campo, risultato; giallo per la vittoria, rosso per la sconfitta, neutro per il pari.
- **Fascia sponsor**: loghi su fondo chiaro, scala di grigi con colore su hover, livelli (main più grande).
- **Card news**: foto full-bleed, titolo sovrapposto su gradiente blu-notte, data piccola in giallo.
- **Widget Tuttocampo**: iframe in contenitore con intestazione propria del sito e link fallback alla scheda squadra.

## Layout

- Griglia 12 colonne desktop, 4 mobile; contenuto max 1200px tranne hero e foto full-bleed.
- Ritmo: sezioni alternano full-bleed scuro e blocchi contenuti; spaziatura verticale variabile (non uniforme).
- Niente card grid identiche: news in griglia asimmetrica (prima notizia doppia).

## Motion

- Easing: ease-out-quart per entrate; scrub hero lineare mappato allo scroll con smoothing.
- Micro: hover link sottolineatura che scorre, card sollevamento 2px. Niente bounce.
- Tutto dietro `prefers-reduced-motion`.

## Assets

- `assets/logo-original.jpeg` — logo raster (JPG social; vettoriale non disponibile, eventualmente da rivettorializzare).
- `assets/hero-video-master-16x9.mp4` / `assets/hero-video-mobile-9x16.mp4` — video hero definitivi (Seedance 2.0, 5s).
- Frame per lo scrub da estrarre con ffmpeg: desktop ~60-80 WebP 16:9, mobile ~40 WebP 9:16, budget < 3 MB mobile.
