import {BufferTarget, BufferUsage, GLBuffer} from "../buffers";
import {GLVertexArray} from "./GLVertexArray";
import {FloatAttributeType} from "./BufferAttributes";

type QuadObjects = {
    vbo: GLBuffer;
    ibo: GLBuffer;
    vao: GLVertexArray;
};

export class QuadBuffer {

    private _objects?: QuadObjects;

    constructor(readonly gl: WebGL2RenderingContext) {
        const vbo = new GLBuffer(gl);
        vbo.bind(BufferTarget.ARRAY_BUFFER);
        vbo.bufferData(VERTEX, BufferUsage.STATIC_DRAW);
        vbo.unbind(BufferTarget.ARRAY_BUFFER);

        const vao = new GLVertexArray(gl);
        vao.bind();
        vao.vertexAttribPointer(vbo, 0, 2, FloatAttributeType.FLOAT, false, 0, 0);

        const ibo = new GLBuffer(gl);
        ibo.bind(BufferTarget.ELEMENT_ARRAY_BUFFER);
        ibo.bufferData(INDICES, BufferUsage.STREAM_DRAW);
        ibo.unbind(BufferTarget.ELEMENT_ARRAY_BUFFER);

        this._objects = {vbo, ibo, vao};
    }

    render(): void {
        const gl = this.gl;
        const objects = this._objects;
        if (!objects)
            throw new Error("QuadBuffer is deleted");

        objects.vao.bind();
        objects.ibo.bind(BufferTarget.ELEMENT_ARRAY_BUFFER);

        gl.drawElements(gl.TRIANGLES, INDICES.length, gl.UNSIGNED_BYTE, 0);

        objects.ibo.unbind(BufferTarget.ELEMENT_ARRAY_BUFFER);
        objects.vao.unbind();
    }

    get deleted(): boolean {
        return !this._objects;
    }

    delete(): void {
        if (this._objects) {
            this._objects.vao.delete();
            this._objects.vbo.delete();
            this._objects.ibo.delete();
            this._objects = undefined;
        }
    }

}

const VERTEX = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    -1.0, 1.0
]);

const INDICES = new Uint8Array([
    0, 1, 2,
    2, 3, 0
]);


