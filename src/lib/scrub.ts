// Logica pura di scrub per l'hero scroll-driven: mappa la posizione di scroll
// a un indice di frame (1-based) e fornisce lo smoothing per l'animazione.

export function frameIndex(scrollY: number, scrollRange: number, frameCount: number): number {
  const t = Math.min(1, Math.max(0, scrollY / scrollRange));
  return Math.min(frameCount, Math.max(1, Math.round(1 + t * (frameCount - 1))));
}

export function lerp(current: number, target: number, alpha: number): number {
  return current + (target - current) * alpha;
}
