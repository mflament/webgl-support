export function check<T>(gl: WebGL2RenderingContext, f: () => T | null): T {
    const obj = f.call(gl);
    if (obj === null)
        throw new Error(f.name);
    return obj;
}

/**
 * @param s color formated as #rrggbbaa
 * @param normalize return normalised color components
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
    return {r: r, g: g, b: b, a: a};
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

export function hasProp<T, K extends keyof T = keyof T>(p: any, key: K, type: "string" | "number" | "object" | "function" | "array" | ((value: T[K]) => boolean)): boolean {
    const prop = p[key];
    if (prop === undefined) return false;
    if (typeof type === "function") return type(prop);
    if (type === "array") return Array.isArray(prop);
    return typeof prop === type;
}

export function glEnumName(constant: GLenum): string {
    const names = WebGL2RenderingContext as unknown as Record<string, number>;
    return Object.keys(names).find(k => names[k] === constant) || constant.toString();
}