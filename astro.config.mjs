// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // `site` non e' ancora impostato: il dominio di produzione non e' stato
  // scelto (vedi docs/HANDOFF.md). Finche' resta assente, og:url/og:image in
  // src/layouts/Base.astro risolvono contro l'origine corrente (localhost o
  // il dominio *.netlify.app assegnato al deploy), non contro un dominio
  // inventato. Quando il dominio sara' registrato, aggiungere qui:
  //   site: "https://IL-DOMINIO-SCELTO",
  // e' l'unica modifica necessaria: nessun altro file va toccato.
});
