# Product

## Register

brand

## Users

- **Tifosi e paesani** di Galati Mamertino (ME): seguono la squadra dai social, arrivano al sito da Instagram/Facebook, quasi sempre da mobile. Cercano risultati, formazione, foto, orgoglio di paese.
- **Sponsor locali attuali e potenziali**: vogliono vedere che la società è seria e che il loro logo è in buona compagnia.
- **Giocatori e famiglie**: si cercano nella rosa e nelle foto.
- **Società** (dirigente/volontario): aggiorna news e rosa via CMS, competenza tecnica minima.

Contesto d'uso dominante: smartphone, connessione 4G di provincia, sessioni brevi. Il mobile è la versione principale, il desktop il caso secondario.

## Product Purpose

Sito-vetrina ufficiale dell'ASD Città di Galati (Prima Categoria Sicilia 2026-27, campo "Ducezio-Parafioriti"). Esiste per: dare dignità e identità digitale al club oltre i social, mostrare risultati e classifica aggiornati automaticamente (widget Tuttocampo), dare visibilità agli sponsor, raccontare rosa e storia. Successo = i tifosi lo linkano con orgoglio, gli sponsor lo citano, la società lo aggiorna da sola.

## Brand Personality

Mix dichiarato di tre anime, da bilanciare:

1. **Orgoglio di paese**: la squadra come simbolo della comunità. Caldo, radicato, appartenenza.
2. **Ambizione e spettacolo**: linguaggio visivo da grande club, effetto wow (hero cinematografico scroll-driven). Sembrare più grandi della categoria.
3. **Grinta genuina**: calcio di provincia vero, niente patinato vuoto. Foto reali di campo, tifo, sudore.

Tono verbale: diretto, orgoglioso, italiano semplice. Mai corporate, mai infantile.

## Anti-references

- **Sito comunale/parrocchiale anni 2010**: layout datato, colori spenti, muri di testo, contatori visite.
- **Template WordPress "soccer club" da marketplace**: caroselli standard, icone stock, struttura fotocopia.
- Sezioni vuote o "in costruzione": meglio una pagina in meno che una pagina morta.

## Design Principles

1. **Mobile è la casa**: ogni scelta si valuta prima sullo schermo di un telefono in 4G. Il desktop eredita.
2. **Grande club, mezzi onesti**: linguaggio visivo ambizioso ma contenuti veri; mai promettere sezioni che la società non può riempire.
3. **Il logo comanda**: palette, hero e cursore derivano dai colori esatti dello stemma. Nessun colore estraneo.
4. **Vivo o assente**: dati che si aggiornano da soli (Tuttocampo) o contenuti statici curati; niente vie di mezzo che invecchiano male.
5. **L'effetto serve la scena**: hero scroll-driven e cursore-pallone sono i due momenti di spettacolo; il resto del sito resta veloce e sobrio per farli risaltare.

## Accessibility & Inclusion

- Contrasti WCAG AA sui testi.
- `prefers-reduced-motion`: hero scroll-driven degrada a immagine statica (frame finale), cursore-pallone disattivato.
- Cursore-pallone solo su dispositivi con puntatore fine (media query `pointer: fine`); mai su touch.
- Navigazione completa da tastiera; focus visibili.
- Widget Tuttocampo in iframe con titolo e fallback testuale (link alla scheda squadra) se non carica.
