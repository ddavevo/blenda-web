// TODO: Sample pixels from screenshot (ImageData or canvas); average RGB; convert to HEX
// TODO: Export computeRepresentativeColor(imageDataUrlOrCanvas): string (HEX)

export function computeRepresentativeColor(_source: string | HTMLCanvasElement): string {
  // TODO: Decode image or read canvas pixels; average R,G,B; return hex string
  return "#000000";
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
