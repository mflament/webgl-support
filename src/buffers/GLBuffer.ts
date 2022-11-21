import {safeCreate} from "../utils";
import {BufferTarget, BufferUsage} from "./GLBufferEnums";

export class GLBuffer {

    readonly glBuffer: WebGLBuffer;
    private _lastTarget?: BufferTarget;
    private _size = 0;

    constructor(readonly gl: WebGL2RenderingContext) {
        this.glBuffer = safeCreate(gl, 'createBuffer');
    }

    get size(): number {
        return this._size;
    }

    bind(target: BufferTarget): void {
        this.gl.bindBuffer(target, this.glBuffer);
        this._lastTarget = target;
    }

    unbind(target: BufferTarget): void {
        this.gl.bindBuffer(target, null);
        if (this._lastTarget === target)
            this._lastTarget = undefined;
    }

    bufferData(size: GLsizeiptr, usage: BufferUsage): void;
    bufferData(srcData: BufferSource | null, usage: BufferUsage): void;
    bufferData(srcData: ArrayBufferView, usage: BufferUsage, srcOffset: GLuint, length?: GLuint): void;
    bufferData(sizeOrSrcData: GLsizeiptr | BufferSource | ArrayBufferView | null, usage: BufferUsage, srcOffset?: GLuint, length?: GLuint): void {
        const gl = this.gl;
        const target = this.checkTarget();
        if (typeof sizeOrSrcData === "number") {
            gl.bufferData(target, sizeOrSrcData, usage);
            this._size = sizeOrSrcData;
        } else if (typeof srcOffset === "number") {
            const buffer = sizeOrSrcData as ArrayBufferView;
            gl.bufferData(target, buffer, usage, srcOffset, length);
            this._size = length !== undefined ? length : buffer.byteLength - srcOffset;
        } else {
            gl.bufferData(target, sizeOrSrcData, usage);
            if (sizeOrSrcData)
                this._size = sizeOrSrcData.byteLength;
        }
    }

    bufferSubData(dstByteOffset: GLintptr, srcData: BufferSource): void;
    bufferSubData(dstByteOffset: GLintptr, srcData: ArrayBufferView, srcOffset: GLuint, length?: GLuint): void;
    bufferSubData(dstByteOffset: GLintptr, srcData: BufferSource | ArrayBufferView, srcOffset?: GLuint, length?: GLuint): void {
        const gl = this.gl;
        const target = this.checkTarget();
        if (typeof srcOffset === "number")
            gl.bufferSubData(target, dstByteOffset, srcData as ArrayBufferView, srcOffset, length);
        else
            gl.bufferSubData(target, dstByteOffset, srcData);
    }

    getBufferData(dstBuffer: ArrayBufferView): void {
        this.getBufferSubData(0, dstBuffer);
    }

    getBufferSubData(srcByteOffset: GLintptr, dstBuffer: ArrayBufferView, dstOffset?: GLuint, length?: GLuint): void {
        this.gl.getBufferSubData(this.checkTarget(), srcByteOffset, dstBuffer, dstOffset, length);
    }

    delete(): void {
        this.gl.deleteBuffer(this.glBuffer);
    }

    private checkTarget(): BufferTarget {
        if (!this._lastTarget)
            throw new Error("Buffer not bound");
        return this._lastTarget;
    }

}
