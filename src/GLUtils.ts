export function check<T>(param: T | null, name: string): T {
  if (!param) throw new Error(name + ' is null');
  return param;
}

/**
 * @param s color formated as #rrggbbaa
 */
export function parseColor(s: string, normalize = true): { r: number; g: number; b: number; a: number } {
  let r = parseInt(s.substring(1, 3), 16);
  let g = parseInt(s.substring(3, 5), 16);
  let b = parseInt(s.substring(5, 7), 16);
  let a = 255;
  if (s.length > 7) a = parseInt(s.substring(7, 9), 16);
  if (normalize) {
    r /= 255;
    g /= 255;
    b /= 255;
    a /= 255;
  }
  return { r: r, g: g, b: b, a: a };
}

export function nextPowerOfTwo(n: number): number {
  if (n === 0) return 1;
  n--;
  n |= n >> 1;
  n |= n >> 2;
  n |= n >> 4;
  n |= n >> 8;
  n |= n >> 16;
  return n + 1;
}
