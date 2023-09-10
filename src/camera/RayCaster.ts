import {mat4, ReadonlyVec2, vec3, vec4} from "gl-matrix";
import {PerspectiveCamera} from "./PerspectiveCamera";

export interface Ray {
    readonly origin: vec3,
    readonly dir: vec3
}

interface RayCaster {
    update(): void;

    cast(ray: Ray, uv: ReadonlyVec2): Ray;
}

export function rayCaster(camera: PerspectiveCamera): RayCaster {
    const v4 = vec4.create(),
        invView = mat4.create(),
        invProjection = mat4.create();

    return {
        update() {
            mat4.invert(invView, camera.view);
            mat4.invert(invProjection, camera.projection);
        },
        cast(ray: Ray, uv: ReadonlyVec2): Ray {
            vec3.copy(ray.origin, vec4.transformMat4(v4, vec4.set(v4, 0, 0, 0, 1), invView) as vec3);
            vec3.copy(ray.dir, vec4.transformMat4(v4, vec4.set(v4, uv[0], uv[1], 0, 1), invProjection) as vec3);
            vec3.copy(ray.dir, vec4.transformMat4(v4, vec4.set(v4, ray.dir[0], ray.dir[1], ray.dir[2], 0), invView) as vec3);
            vec3.normalize(ray.dir, ray.dir);
            return ray;
        }
    };
}