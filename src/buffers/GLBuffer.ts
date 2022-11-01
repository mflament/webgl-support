import {hasProp, safeCreate} from "../utils";
import {BufferUsage} from "../GLEnums";

type BufferPropsWithSize = { size: number };
type BufferPropsWithArrayBufferView = { array: ArrayBufferView, srcOffset?: number, length?: number };
type BufferPropsWithBufferSource = { buffer: BufferSource };

type BufferDataParam = { usage?: BufferUsage } & (BufferPropsWithSize | BufferPropsWithArrayBufferView | BufferPropsWithBufferSource);
type BufferSubDataParam = { dstOffset?: number } & (BufferPropsWithArrayBufferView | BufferPropsWithBufferSource);

function isBufferPropsWithSize(props: BufferDataParam) : props is BufferPropsWithSize {
    return hasProp<BufferPropsWithSize>(props, "size", "number");
}

function isBufferPropsWithArrayBufferView(props: BufferDataParam) : props is BufferPropsWithArrayBufferView {
    return hasProp<BufferPropsWithArrayBufferView>(props, "array", "object");
}

function isBufferPropsWithBufferSource(props: BufferDataParam) : props is BufferPropsWithBufferSource {
    return hasProp<BufferPropsWithBufferSource>(props, "buffer", "object");
}

export enum GLBufferTarget {
    ARRAY_BUFFER = WebGL2RenderingContext.ARRAY_BUFFER,
    ELEMENT_ARRAY_BUFFER = WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER
}

export abstract class GLBuffer {

    readonly glBuffer: WebGLBuffer;

    protected constructor(readonly gl: WebGL2RenderingContext, readonly target: GLBufferTarget) {
        this.glBuffer = safeCreate(gl, 'createBuffer');
    }

    bind(): void {
        this.gl.bindBuffer(this.target, this.glBuffer);
    }

    unbind(): void {
        this.gl.bindBuffer(this.target, null);
    }

    bufferData(data: BufferDataParam): void {
        const gl = this.gl;
        const usage = data.usage || BufferUsage.STATIC_DRAW;
        if (isBufferPropsWithArrayBufferView(data))
            gl.bufferData(this.target, data.array, usage, data.srcOffset || 0, data.length);
        else if (isBufferPropsWithBufferSource(data))
            gl.bufferData(this.target, data.buffer, usage);
        else if (isBufferPropsWithSize(data))
            gl.bufferData(this.target, data.size, usage);
        else
            throw new Error("Invalid buffer data");
    }

    bufferSubData(data: BufferSubDataParam): void {
        const gl = this.gl;
        if (isBufferPropsWithArrayBufferView(data))
            gl.bufferSubData(this.target, data.dstOffset || 0, data.array, data.srcOffset || 0, data.length);
        else if (isBufferPropsWithBufferSource(data))
            gl.bufferSubData(this.target, data.dstOffset || 0, data.buffer);
        else
            throw new Error("Invalid buffer data " + data);
    }

    delete(): void {
        this.gl.deleteBuffer(this.glBuffer);
    }
}

export class GLArrayBuffer extends GLBuffer {
    constructor(gl: WebGL2RenderingContext) {
        super(gl, gl.ARRAY_BUFFER);
    }
}

export class GLElementArrayBuffer extends GLBuffer {
    constructor(gl: WebGL2RenderingContext) {
        super(gl, gl.ELEMENT_ARRAY_BUFFER);
    }
}