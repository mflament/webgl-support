import {mat4} from "gl-matrix";

export abstract class Camera {
    view = mat4.create();
    projection = mat4.create();
    viewProj = mat4.create();
    viewDirty = true;
    projectionDirty = true;

    abstract update(): void;

    onResize?(width: number, height: number): void;

    get dirty(): boolean {
        return this.viewDirty || this.projectionDirty;
    }

    set dirty(dirty: boolean) {
        this.viewDirty = this.projectionDirty = dirty;
    }
}