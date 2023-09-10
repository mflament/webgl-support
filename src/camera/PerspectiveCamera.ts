import {mat4, vec3} from 'gl-matrix';
import {Camera} from "./Camera";

export class PerspectiveCamera extends Camera {
    position = vec3.create();
    target = vec3.create();
    up = vec3.create();

    fov = Math.PI * 0.35; // in rad, ~70 deg
    near = 0.1;
    far = 100;
    aspect = 1;

    constructor() {
        super();
        vec3.set(this.position, 0, 0, 1.5);
        vec3.set(this.target, 0, 0, 0);
        vec3.set(this.up, 0, 1, 0);
    }

    update(): void {
        const {viewDirty, projectionDirty} = this;
        if (viewDirty || projectionDirty) {
            if (viewDirty)
                mat4.lookAt(this.view, this.position, this.target, this.up);
            if (projectionDirty)
                mat4.perspective(this.projection, this.fov, this.aspect, this.near, this.far);
            mat4.multiply(this.viewProj, this.projection, this.view);
        }
    }

    onResize(width: number, height: number) {
        this.aspect = width / height;
        this.projectionDirty = true;
    }

}

