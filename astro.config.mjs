// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // `site` non e' ancora impostato: il dominio di produzione non e' stato
  // scelto (vedi docs/HANDOFF.md). Finche' resta assente, og:url/og:image in
  // src/layouts/Base.astro risolvono contro l'origine corrente, non contro un
  // dominio inventato. Quando il dominio sara' registrato, aggiungere qui:
  //   site: "https://IL-DOMINIO-SCELTO",
  //
  // Da fare NELLO STESSO momento, perche' tutto dipende da `site`:
  //   - sitemap:  npm i @astrojs/sitemap  + integrations: [sitemap()]
  //   - feed RSS: npm i @astrojs/rss      + src/pages/rss.xml.js
  //   - anteprime social per singolo articolo (og:image con la copertina)
  // Prima del dominio questi tre punti non sono realizzabili in modo corretto:
  // genererebbero indirizzi assoluti su "localhost".
});
