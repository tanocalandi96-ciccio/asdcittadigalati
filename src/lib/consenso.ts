// Gestione del consenso ai servizi di terze parti.
//
// Perche' esiste: il sito incorpora contenuti serviti da altri (la mappa
// OpenStreetMap, i widget Tuttocampo). Nel momento in cui il browser carica
// quegli iframe, contatta i loro server e questi possono impostare cookie o
// registrare l'indirizzo IP. GDPR ed ePrivacy chiedono che questo avvenga
// DOPO una scelta libera dell'utente, non prima.
//
// Quindi gli iframe non vengono messi in pagina finche' il consenso manca:
// al loro posto compare un riquadro che spiega cosa si sta per caricare, con
// un pulsante per attivarlo. Chi accetta una volta non se lo ritrova piu'.

export const CHIAVE = "consenso-terze-parti";

export type StatoConsenso = "accettato" | "rifiutato" | null;

export function leggiConsenso(): StatoConsenso {
  try {
    const v = localStorage.getItem(CHIAVE);
    return v === "accettato" || v === "rifiutato" ? v : null;
  } catch {
    // localStorage non disponibile (navigazione privata bloccata, storage
    // pieno): si considera "non deciso", quindi niente caricamenti.
    return null;
  }
}

export function scriviConsenso(stato: Exclude<StatoConsenso, null>): void {
  try {
    localStorage.setItem(CHIAVE, stato);
  } catch {
    // Senza memoria la scelta vale per la sessione corrente: meglio questo
    // che bloccare l'utente.
  }
  document.dispatchEvent(new CustomEvent("consenso-cambiato", { detail: stato }));
}
