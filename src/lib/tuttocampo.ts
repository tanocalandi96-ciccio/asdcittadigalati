export const TEAM_ID = "916584";
export const TEAM_PAGE = "https://www.tuttocampo.it/Sicilia/PrimaCategoria/GironeD/Squadra/CittaDiGalati/916584/Scheda";

// I widget Tuttocampo sono gratuiti per i siti delle societa' sportive e non
// sono legati al dominio: l'URL ha forma
//   https://www.tuttocampo.it/WidgetV2/<Tipo>/<GUID-del-girone>
// I tipi che esistono davvero (verificati uno per uno il 27/07/2026) sono:
//   Classifica, Risultati, Marcatori, Partita, ProssimaPartita.
// NON esiste un tipo "Calendario": quell'URL risponde 404. La sezione
// Calendario di /stagione va quindi risolta in altro modo quando la FIGC
// pubblichera' il calendario 2026-27 (vedi docs/HANDOFF.md, sezione 2.3).
//
// Il GUID del girone non e' pubblicato sulle pagine pubbliche: si ottiene dal
// generatore su https://www.tuttocampo.it/WidgetApi dopo il login con un
// account Tuttocampo gratuito, scegliendo Sicilia / Prima Categoria / Girone D.
// Finche' le chiavi restano vuote, i componenti mostrano il fallback.
export const WIDGET_URLS: Partial<
  Record<"classifica" | "risultati" | "calendario" | "prossimaPartita", string>
> = {};
