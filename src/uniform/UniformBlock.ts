import {vec2} from "gl-matrix";

const FLOAT32_BYTES = 4;
const INT32_BYTES = 4;

export class UniformBlock {
    private readonly dataView: DataView;
    private readonly glBuffer: WebGLBuffer;
    private _size: number;
    private _updateRange: vec2 = [Number.MAX_VALUE, Number.MIN_VALUE];

    constructor(readonly gl: WebGL2RenderingContext, readonly blockBinding: number, private readonly buffer: Uint8Array) {
        const glBuffer = gl.createBuffer();
        if (!glBuffer)
            throw new Error("Error creating gl buffer");
        this.glBuffer = glBuffer;
        gl.bindBuffer(gl.UNIFORM_BUFFER, this.glBuffer);
        gl.bufferData(gl.UNIFORM_BUFFER, buffer.length, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, blockBinding, this.glBuffer);
        this._size = buffer.length;
        this.dataView = new DataView(this.buffer.buffer)
    }

    delete(): void {
        this.gl.deleteBuffer(this.glBuffer);
    }

    get size(): number {
        return this._size;
    }

    set size(s: number) {
        this._size = Math.min(this.capacity, s);
    }

    get capacity(): number {
        return this.buffer.length;
    }

    setFloat(byteOffset: number, value: number): this {
        this.dataView.setFloat32(byteOffset, value, true);
        this.setUpdateRange(byteOffset, FLOAT32_BYTES);
        return this;
    }

    setFloats(dstOffset: number, data: ArrayLike<number>, srcOffset = 0, length = data.length): this {
        for (let i = srcOffset, j = dstOffset; i < length; i++, j += FLOAT32_BYTES) {
            this.dataView.setFloat32(j, data[i]);
        }
        this.setUpdateRange(dstOffset, length * FLOAT32_BYTES);
        return this;
    }

    setInt(byteOffset: number, value: number): this {
        this.dataView.setInt32(byteOffset, value, true);
        this.setUpdateRange(byteOffset, INT32_BYTES);
        return this;
    }

    setInts(dstOffset: number, data: ArrayLike<number>, srcOffset = 0, length = data.length): this {
        for (let i = srcOffset, j = dstOffset; i < length; i++, j += FLOAT32_BYTES) {
            this.dataView.setInt32(j, data[i]);
        }
        this.setUpdateRange(dstOffset, length * INT32_BYTES);
        return this;
    }

    updater(offset = 0): UniformBlockUpdater {
        return new UniformBlockUpdater(this, offset);
    }

    updateGlBuffer(force = false): void {
        const [start, end] = force ? [0, this._size] : this._updateRange;
        if (end > start) {
            const {gl, glBuffer, buffer} = this;
            gl.bindBuffer(gl.UNIFORM_BUFFER, glBuffer);
            gl.bufferSubData(gl.UNIFORM_BUFFER, start, buffer, start, end - start);
            gl.bindBuffer(gl.UNIFORM_BUFFER, null);
            vec2.set(this._updateRange, Number.MAX_VALUE, Number.MIN_VALUE);
        }
    }

    private setUpdateRange(offset: number, length: number): void {
        const end = offset + length;
        this._updateRange[0] = Math.min(offset, this._updateRange[0]);
        this._updateRange[1] = Math.max(end, this._updateRange[1]);
    }

}

export class UniformBlockUpdater {
    constructor(readonly block: UniformBlock, public offset: number) {
    }

    pushFloat(value: number): this {
        this.block.setFloat(this.offset, value);
        this.offset += INT32_BYTES;
        return this;
    }

    pushFloats(data: ArrayLike<number>, srcOffset = 0, length = data.length): this {
        this.block.setFloats(this.offset, data, srcOffset, length);
        this.offset += length * FLOAT32_BYTES;
        return this;
    }

    pushInt(value: number): this {
        this.block.setInt(this.offset, value);
        this.offset += INT32_BYTES;
        return this;
    }

    pushInts(data: ArrayLike<number>, srcOffset = 0, length = data.length): this {
        this.block.setInts(this.offset, data, srcOffset, length);
        this.offset += length * INT32_BYTES;
        return this;
    }

    update(): void {
        this.block.updateGlBuffer();
    }
}