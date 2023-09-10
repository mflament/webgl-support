import {GLBuffer} from "../buffers";

export enum TFBPrimitiveMode {
    POINTS = WebGL2RenderingContext.POINTS,
    LINES = WebGL2RenderingContext.LINES,
    TRIANGLES = WebGL2RenderingContext.TRIANGLES
}

export class GLTransformFeedback {
    private _glTransformFeedback: WebGLTransformFeedback | null;

    constructor(readonly gl: WebGL2RenderingContext) {
        this._glTransformFeedback = gl.createTransformFeedback();
    }

    get glTransformFeedback(): WebGLTransformFeedback | null {
        return this._glTransformFeedback;
    }

    bind(): void {
        const gl = this.gl;
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.glTransformFeedback);
    }

    bindBufferBase(index: number, buffer: WebGLBuffer | GLBuffer | null): void {
        const gl = this.gl;
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, index, buffer instanceof GLBuffer ? buffer.glBuffer : buffer);
    }

    unbind(): void {
        const gl = this.gl;
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    }

    begin(mode: TFBPrimitiveMode): void {
        this.gl.beginTransformFeedback(mode);
    }

    end(): void {
        this.gl.endTransformFeedback();
    }

    pause(): void {
        this.gl.pauseTransformFeedback();
    }

    resume(): void {
        this.gl.resumeTransformFeedback();
    }

    delete(): void {
        if (this._glTransformFeedback) {
            this.gl.deleteTransformFeedback(this._glTransformFeedback);
            this._glTransformFeedback = null;
        }
    }
}