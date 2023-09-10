import {check} from "../utils";

export class QuadBuffer {

    private readonly vbo: WebGLBuffer;
    private readonly vao: WebGLVertexArrayObject;

    constructor(readonly gl: WebGL2RenderingContext) {
        const vbo = check(gl, gl.createBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, QUAD_VERTICES, gl.STATIC_DRAW);
        this.vbo = vbo;

        const vao = check(gl, gl.createVertexArray);
        gl.bindVertexArray(vao);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 2 * 4, 0);
        this.vao = vao;
    }

    bind() {
        this.gl.bindVertexArray(this.vao);
    }

    draw(): void {
        const gl = this.gl;
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    drawInstanced(instanceCount: number): void {
        const gl = this.gl;
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, instanceCount);
    }

    delete(): void {
        const {gl, vao, vbo} = this;
        gl.deleteVertexArray(vao);
        gl.deleteBuffer(vbo);
    }

}

const QUAD_VERTICES = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,

    -1.0, -1.0,
    1.0, 1.0,
    -1.0, 1.0,
]);
