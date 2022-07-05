import {vec3} from "gl-matrix";

export function toRad(deg: number): number {
    return deg * Math.PI / 180
}

export function toDeg(rad: number): number {
    return rad * 180 / Math.PI;
}

export function clamp(v: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, v));
}

const _vtmp = vec3.create();

export function projectOnVector(out: vec3, v: vec3, t: vec3): vec3 {
    const denominator = vec3.sqrLen(t);
    if (denominator === 0)
        return vec3.set(out, 0, 0, 0);
    const scalar = vec3.dot(v, t) / denominator;
    return vec3.scale(out, t, scalar);
}

// out = v projected on plane with normal planeNormal
export function projectOnPlane(out: vec3, v: vec3, planeNormal: vec3): vec3 {
    vec3.copy(_vtmp, v);
    projectOnVector(out, v, planeNormal);
    return vec3.sub(out, out, _vtmp);
}

/**
 * https://en.wikipedia.org/wiki/Spherical_coordinate_system
 * @return [radius r, inclination θ, azimuth φ]
 * wikipedia : opengl
 *  x : z
 *  y : x
 *  z : y
 */
export function toSpherical(out: vec3, cartesian: vec3): vec3 {
    const [x, y, z] = cartesian;
    out[0] = Math.sqrt(x * x + y * y + z * z);
    out[1] = Math.acos(y / out[0]);
    if (z > 0) {
        out[2] = Math.atan(x / z);
    } else if (z < 0 && x >= 0) {
        out[2] = Math.atan(x / z) + Math.PI;
    } else if (z < 0 && x < 0) {
        out[2] = Math.atan(x / z) - Math.PI;
    } else if (z === 0 && x > 0) {
        out[2] = Math.PI / 2;
    } else if (z === 0 && x < 0) {
        out[2] = -Math.PI / 2;
    } else if (z === 0 && x === 0) {
        out[2] = NaN;
    }
    return out;
}

export function fromSpherical(out: vec3, spherical: vec3): vec3 {
    const [r, i, a] = spherical;
    out[0] = r * Math.sin(a) * Math.sin(i);
    out[1] = r * Math.cos(i);
    out[2] = r * Math.cos(a) * Math.sin(i);
    return out;
}

export function abs(out: vec3, v: vec3): vec3 {
    vec3.set(out, Math.abs(v[0]), Math.abs(v[1]), Math.abs(v[2]));
    return out;
}