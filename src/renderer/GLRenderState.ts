import { BufferTarget } from '../GLEnums';
import { GLTexture, isGLTexture } from '../texture/GLTexture';

export class GLRenderState {
  private _program: WebGLProgram | null = null;
  private _buffers: { [target: number]: WebGLBuffer | null } = {};
  private _vertexArray: WebGLVertexArrayObject | null = null;

  private _frameBuffer: WebGLFramebuffer | null = null;

  private _textureUnit = 0;
  private _textures2D: { [unit: number]: WebGLTexture | null } = {};

  constructor(readonly gl: WebGL2RenderingContext) {}

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
    const actual = this._buffers[target];
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

  getTexture2D(): WebGLTexture | null {
    return this._textures2D[this._textureUnit] || null;
  }

  bindTexture2D(texture: GLTexture | WebGLTexture | null): WebGLTexture | null {
    const { gl, _textures2D, _textureUnit } = this;

    if (isGLTexture(texture)) texture = texture.texture;

    const actual = _textures2D[_textureUnit];
    if (actual !== texture) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      _textures2D[_textureUnit] = texture;
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
