import {BufferTarget, TextureTarget} from './GLEnums';
import {GLTexture} from './texture/GLTexture';
import {isGLTexture} from "../test/dist/src";

export class GLState {
    private _program: WebGLProgram | null = null;
    private _buffers: { [target: number]: WebGLBuffer | null } = {};
    private _vertexArray: WebGLVertexArrayObject | null = null;

    private _frameBuffer: WebGLFramebuffer | null = null;

    private _textureUnit = 0;
    private _textures: { [unit: number]: { [target: number]: WebGLTexture | null } } = {};
    private _samplers: { [unit: number]: WebGLSampler | null } = {};

    constructor(readonly gl: WebGL2RenderingContext) {
    }

    getProgram(): WebGLProgram | null {
        return this._program;
    }

    useProgram(program: WebGLProgram | null): WebGLProgram | null {
        const actual = this._program;
        if (actual !== program) {
            this.gl.useProgram(program);
            this._program = program;
        }
        return actual;
    }

    getBuffer(target: BufferTarget): WebGLBuffer | null {
        return this._buffers[target] || null;
    }

    bindVertexBuffer(buffer: WebGLBuffer | null): WebGLBuffer | null {
        return this.bindBuffer(BufferTarget.ARRAY_BUFFER, buffer);
    }

    bindIndexBuffer(buffer: WebGLBuffer | null): WebGLBuffer | null {
        return this.bindBuffer(BufferTarget.ELEMENT_ARRAY_BUFFER, buffer);
    }

    bindBuffer(target: BufferTarget, buffer: WebGLBuffer | null): WebGLBuffer | null {
        const actual = this.getBuffer(target);
        if (actual !== buffer) {
            this.gl.bindBuffer(target, buffer);
            this._buffers[target] = buffer;
        }
        return actual;
    }

    getVertexArray(): WebGLVertexArrayObject | null {
        return this._vertexArray;
    }

    bindVertexArray(vertexArray: WebGLVertexArrayObject | null): WebGLVertexArrayObject | null {
        const actual = this._vertexArray;
        if (actual !== vertexArray) {
            this.gl.bindVertexArray(vertexArray);
            this._vertexArray = vertexArray;
        }
        return actual;
    }

    getActiveTextureUnit(): number {
        return this._textureUnit;
    }

    setActiveTextureUnit(unit: number): number {
        const gl = this.gl;
        const actual = this._textureUnit;
        if (actual !== unit) {
            gl.activeTexture(gl.TEXTURE0 + unit);
            this._textureUnit = unit;
        }
        return actual;
    }

    getTexture(target: TextureTarget): WebGLTexture | null {
        const unitTextures = this._textures[this._textureUnit];
        return (unitTextures && unitTextures[target]) || null;
    }

    bindTexture(texture: GLTexture): WebGLTexture | null;
    bindTexture(target: TextureTarget, texture: WebGLTexture | null): WebGLTexture | null;
    bindTexture(targetOrTexture: TextureTarget | GLTexture, texture?: WebGLTexture | null): WebGLTexture | null {
        const {gl, _textures, _textureUnit} = this;
        let target;
        if (typeof targetOrTexture === "object") {
            target = targetOrTexture.target;
            texture = targetOrTexture.texture;
        } else {
            target = targetOrTexture;
            texture = isGLTexture(texture) ? texture.texture : texture || null;
        }

        const actual = this.getTexture(target);
        if (actual !== texture) {
            gl.bindTexture(target, texture);
            _textures[_textureUnit] = _textures[_textureUnit] || [];
            _textures[_textureUnit][target] = texture;
        }
        return actual;
    }

    getSampler(unit: number): WebGLSampler | null {
        return this._samplers[unit] || null;
    }

    bindSampler(unit: number, sampler: WebGLSampler | null): WebGLTexture | null {
        const {gl, _samplers: samplers} = this;
        const actual = this.getSampler(unit);
        if (actual !== sampler) {
            gl.bindSampler(unit, sampler);
            samplers[unit] = sampler;
        }
        return actual;
    }

    bindFrameBuffer(frameBuffer: WebGLFramebuffer | null): WebGLFramebuffer | null {
        const actual = this._frameBuffer;
        const gl = this.gl;
        if (actual !== frameBuffer) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
            this._frameBuffer = frameBuffer;
        }
        return actual;
    }
}
