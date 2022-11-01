import {GLArrayBuffer, GLElementArrayBuffer, GLVertexArray} from "../buffers";
import {IndexAttributeType} from "../GLEnums";
import {separate} from "../vao";

export class QuadBuffer {
    private readonly vertexBuffer: GLArrayBuffer;
    private readonly indexBuffer: GLElementArrayBuffer;
    private readonly vertexArray: GLVertexArray;

    constructor(readonly gl: WebGL2RenderingContext) {
        const vbo = this.vertexBuffer = new GLArrayBuffer(gl);
        vbo.bind();
        vbo.bufferData({array: VERTEX})

        this.vertexArray = new GLVertexArray(gl);
        this.vertexArray.attributes = separate().vec2(vbo).build();

        const ibo = this.indexBuffer = new GLElementArrayBuffer(gl);
        ibo.bind();
        ibo.bufferData({buffer: INDICES});
        ibo.unbind();
    }

    render(): void {
        const {gl, vertexArray, indexBuffer} = this;

        vertexArray.bind();
        indexBuffer.bind();

        gl.drawElements(gl.TRIANGLES, INDICES.length, IndexAttributeType.UNSIGNED_BYTE, 0);

        indexBuffer.unbind();
        vertexArray.unbind();
    }

    delete(): void {
        this.vertexArray.delete();
        this.vertexBuffer.delete();
        this.indexBuffer.delete();
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


