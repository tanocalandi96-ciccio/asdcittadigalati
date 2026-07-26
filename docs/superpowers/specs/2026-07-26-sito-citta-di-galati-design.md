# Spec — Sito web ASD Città di Galati

Data: 2026-07-26. Stato: in revisione utente.
Contesto strategico e visivo: vedi `PRODUCT.md` e `DESIGN.md` (fonte di verità per palette, font, componenti). Questa spec definisce architettura, comportamenti e criteri di verifica.

## 1. Architettura

- **Astro** (sito statico) + **Decap CMS** per contenuti editabili (news, rosa, sponsor).
- Deploy **Netlify**: hosting gratuito, Netlify Identity + git-gateway per il login CMS del dirigente, Netlify Forms per i contatti.
- Repo git già inizializzato (`main`).
- Dati campionato: **widget Tuttocampo** in iframe (account gratuito; squadra id 916584). Girone Prima Categoria 2026-27 da configurare quando la FIGC pubblica i gironi (ago/set 2026).

## 2. Pagine

| Pagina | Contenuto | Fonte dati |
|---|---|---|
| Home | Hero scroll-driven, ultime 3 news, prossima partita/ultimo risultato, fascia sponsor, feed social | CMS + widget |
| Squadra | Rosa (card giocatore: nome, ruolo, numero, foto o silhouette), staff, dirigenza | CMS |
| Stagione | Classifica, calendario, risultati | widget Tuttocampo |
| News | Lista articoli, griglia asimmetrica (prima doppia) | CMS |
| Club | Storia, palmarès, campo "Ducezio-Parafioriti" con mappa | statico |
| Contatti | Form Netlify, dati societari, footer legale | statico |

Niente sezioni che la società non può riempire (principio "vivo o assente").

## 3. Hero scroll-driven

Asset definitivi (Seedance 2.0, first+last frame, approvati):
- `assets/hero-video-master-16x9.mp4` (1080p, desktop)
- `assets/hero-video-mobile-9x16.mp4` (1080p reframe, mobile)

Implementazione:
1. Estrazione frame con ffmpeg → WebP: desktop ~70 frame 16:9 (~1280w), mobile ~40 frame 9:16 (~720w). Budget: <3 MB totali mobile, <6 MB desktop.
2. Canvas full-viewport; scroll della prima sezione (~200vh) mappato all'indice frame con smoothing (lerp). Niente `video.currentTime` (inaffidabile iOS).
3. Scelta set frame via media query orientamento/larghezza; caricamento lazy progressivo (primi 10 frame subito, resto async).
4. A fine assemblaggio (ultimo frame) entrano titolo + CTA (ease-out-quart).
5. Fallback: `prefers-reduced-motion` o JS assente → frame finale statico come immagine. `<noscript>` incluso.

Difetto noto accettato: testo fascia illeggibile ~2,4s (frame intermedi); mitigazione possibile in seguito rigenerando il segmento, non bloccante.

## 4. Cursore-pallone (variante approvata: cursore = pallone)

- SVG pallone disegnato con spicchi nei colori esatti del logo (giallo `#F8F000`, blu `#0106FF`, rosso `#FE0000`, cuciture nere, riflesso oro `#F87800`).
- Sostituisce il puntatore (`cursor: none`) solo quando attivo; ruota proporzionalmente al movimento orizzontale; scala 1.8× su elementi interattivi.
- Attivo solo con `(pointer: fine)` e senza `prefers-reduced-motion`. Mai su touch.
- Prototipo di riferimento: `mockups/cursor-demo.html` (variante 1).

## 5. Contenuti e CMS

Collezioni Decap: `news` (titolo, data, foto, corpo), `giocatori` (nome, ruolo, numero, foto), `staff`, `sponsor` (logo, livello main/tecnico/secondario, URL). Editing dal browser, commit su git via git-gateway.

Materiali da procurare (bloccanti per la messa online, non per lo sviluppo):
- Loghi sponsor + livelli; dati legali societari (nome completo, sede, CF/P.IVA, contatti, PEC) per footer e privacy
- Rosa con foto (o silhouette) e liberatorie; storia e palmarès; 15-25 foto reali
- Logo vettoriale (se arriva, sostituisce il raster; eventuale rivettorializzazione a preventivo)
- Dominio (intestato alla società) e account Netlify/Tuttocampo

## 6. Gestione errori / edge

- Widget Tuttocampo assente o girone non pubblicato → blocco con messaggio "Classifica in aggiornamento" + link alla scheda Tuttocampo della squadra.
- Foto giocatore mancante → silhouette con colori società.
- Cookie banner + privacy policy (iframe Tuttocampo e embed social = cookie di terze parti). Foto minori solo con liberatoria.
- Form contatti: honeypot antispam Netlify.

## 7. Verifica (criteri di successo)

- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95 su Home.
- Hero fluido (nessun jank visibile) su viewport mobile emulato; peso trasferito Home mobile < 3,5 MB primo load.
- Contrasti AA verificati sulla palette; navigazione tastiera completa; `prefers-reduced-motion` testato.
- Decap: un non-tecnico riesce a pubblicare una news (test guidato col dirigente).
- Deploy preview Netlify approvato dall'utente prima del collegamento al dominio.

## 8. Fuori scope (v1)

Biglietteria, shop, statistiche giocatore, multilingua, area riservata, app. Settore giovanile solo se arrivano liberatorie.
