export function getUnitRegexp(unit: string) {
  return new RegExp(`"[^"]+"|'[^']+'|url\\([^\\)]+\\)|(\\d*\\.?\\d+)${unit}`, 'g');
}

export function isInCalcOrVar(value: string): boolean {
  return /(?:calc|var|max|min|clamp)\(/.test(value);
}
