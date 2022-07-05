const FLOAT32_BYTES = 4;
const INT32_BYTES = 4;


export class UniformBlock {
    private readonly dataView: DataView;
    private readonly glBuffer: WebGLBuffer;
    private _size: number;
    dirty = false;

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
        this.dirty = true;
        return this;
    }

    setFloats(dstOffset: number, data: ArrayLike<number>, srcOffset = 0, length = data.length): this {
        for (let i = srcOffset; i < length; i++, dstOffset += FLOAT32_BYTES) {
            this.dataView.setFloat32(dstOffset, data[srcOffset]);
        }
        this.dirty = true;
        return this;
    }

    setInt(byteOffset: number, value: number): this {
        this.dataView.setInt32(byteOffset, value, true);
        this.dirty = true;
        return this;
    }

    setInts(dstOffset: number, data: ArrayLike<number>, srcOffset = 0, length = data.length): this {
        for (let i = srcOffset; i < length; i++, dstOffset += FLOAT32_BYTES) {
            this.dataView.setInt32(dstOffset, data[srcOffset]);
        }
        this.dirty = true;
        return this;
    }

    updater(offset = 0): UniformBlockUpdater {
        return new UniformBlockUpdater(this, offset);
    }

    updateGlBuffer(force = false): void {
        if (this.dirty || force) {
            const {gl, glBuffer, buffer} = this;
            gl.bindBuffer(gl.UNIFORM_BUFFER, glBuffer);
            gl.bufferSubData(gl.UNIFORM_BUFFER, 0, buffer, 0, this._size);
            gl.bindBuffer(gl.UNIFORM_BUFFER, null);
            this.dirty = false;
        }
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