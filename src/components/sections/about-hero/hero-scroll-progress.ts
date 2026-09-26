export function heroScrollProgress(
  rectBottom: number,
  rectHeight: number,
  viewportHeight: number,
): number {
  const span = rectHeight + viewportHeight;
  if (span <= 0) return 0;
  return Math.max(0, Math.min(1, (viewportHeight - rectBottom) / span));
}
