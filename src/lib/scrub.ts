// Logica pura di scrub per l'hero scroll-driven: mappa la posizione di scroll
// a un indice di frame (1-based) e fornisce lo smoothing per l'animazione.

// Posizione frazionaria tra i frame (1..frameCount). Non arrotonda: la parte
// decimale serve a dissolvere un frame nel successivo, altrimenti lo scroll
// mostra stacchi netti ogni volta che salta piu' frame in un colpo solo.
export function framePosition(scrollY: number, scrollRange: number, frameCount: number): number {
  if (frameCount <= 1) return 1;
  if (!(scrollRange > 0)) return frameCount;
  const t = Math.min(1, Math.max(0, scrollY / scrollRange));
  return 1 + t * (frameCount - 1);
}

export function frameIndex(scrollY: number, scrollRange: number, frameCount: number): number {
  const t = Math.min(1, Math.max(0, scrollY / scrollRange));
  return Math.min(frameCount, Math.max(1, Math.round(1 + t * (frameCount - 1))));
}

export function lerp(current: number, target: number, alpha: number): number {
  return current + (target - current) * alpha;
}
