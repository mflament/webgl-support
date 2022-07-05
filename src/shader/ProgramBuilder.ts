import { check } from '../utils/GLUtils';
import { VaryingBufferMode } from '../GLEnums';

export class ProgramBuilder {
  private readonly _handle: WebGLProgram;
  private _vs?: WebGLShader;
  private _fs?: WebGLShader;
  private _varyings?: { names: string[]; bufferMode: VaryingBufferMode };

  constructor(readonly gl: WebGL2RenderingContext) {
    this._handle = check(gl.createProgram(), 'program');
  }

  vertexShader(source: string): this {
    this._vs = this.compileShader(source, WebGL2RenderingContext.VERTEX_SHADER);
    return this;
  }

  fragmentShader(source: string): this {
    this._fs = this.compileShader(source, WebGL2RenderingContext.FRAGMENT_SHADER);
    return this;
  }

  varyings(names: string[], bufferMode: VaryingBufferMode): this {
    this._varyings = { names: names, bufferMode: bufferMode };
    return this;
  }

  link(): WebGLProgram {
    if (!this._vs) throw new Error('No vertex shader');
    if (!this._fs) throw new Error('No fragment shader');

    const program = this._handle;
    const gl = this.gl;
    [this._vs, this._fs].forEach(shader => {
      gl.attachShader(program, shader);
      gl.deleteShader(shader);
    });

    const varyings = this._varyings;
    if (varyings) {
      gl.transformFeedbackVaryings(program, varyings.names, varyings.bufferMode);
    }

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw 'Error linking program ' + log;
    }

    return program;
  }

  private compileShader(source: string, type: number): WebGLShader {
    const gl = this.gl;
    const shader = check(gl.createShader(type), 'shader');
    source = source.trimStart();
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      const sourceWithLineNums = source
        .split('\n')
        .map((line, index) => String(index + 1).padEnd(5, ' ') + ': ' + line)
        .join('\n');
      throw `shader compile error ${sourceWithLineNums}\n${log}`;
    }
    return shader;
  }
}
