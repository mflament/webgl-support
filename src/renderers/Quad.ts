import { Renderer, RunningState } from '../Renderer';
import { GLContext } from '../GLContext';
import { IndexType, FloatPointerType } from '../GLEnums';

// language=glsl
const VERTEX_SHADER = `
  #version 300 es
  precision highp float;

  layout(location = 0) in vec2 position;
  smooth out vec2 p;
  smooth out vec2 uv;

  void main()
  {
    p = position.xy;
    uv = (position.xy + 1.0) * 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export class QuadRenderer implements Renderer {
  static readonly VS = VERTEX_SHADER;

  readonly program: WebGLProgram;
  private readonly quadBuffer: QuadBufferInstance;

  prepare?: (runningState: RunningState) => boolean;

  constructor(context: GLContext, fragmentShader: string, vertexShader?: string);
  constructor(context: GLContext, program: WebGLProgram);
  constructor(readonly context: GLContext, param: string | WebGLProgram, vertexShader = VERTEX_SHADER) {
    if (typeof param === 'string') {
      this.program = context.programBuilder().fragmentShader(param).vertexShader(vertexShader).link();
    } else {
      this.program = param;
    }
    this.quadBuffer = QuadBuffer.acquire(context);
  }

  render(runningState: RunningState): void {
    const glState = this.context.glState;
    glState.useProgram(this.program);
    if (!this.prepare || this.prepare(runningState)) {
      this.quadBuffer.render();
    }
  }

  delete(): void {
    const gl = this.context.gl;
    this.quadBuffer.delete();
    gl.deleteProgram(this.program);
  }
}

// prettier-ignore
const VERTEX = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    -1.0, 1.0
]);

// prettier-ignore
const INDICES = new Uint8Array([
    0, 1, 2,
    2, 3, 0
]);

interface QuadBufferInstance {
  render(): void;

  delete(): void;
}

class QuadBuffer {
  private readonly vertexArray: WebGLVertexArrayObject;
  private readonly indexBuffer: WebGLBuffer;
  private readonly vertexBuffer: WebGLBuffer;
  private ref = 0;

  private constructor(readonly context: GLContext) {
    const state = context.glState;
    this.vertexBuffer = context.createVertexBuffer(VERTEX);
    state.bindVertexBuffer(this.vertexBuffer);

    this.vertexArray = context.createVertexArray(builder => builder.vertexAttribPointer(2, FloatPointerType.FLOAT).build());
    state.bindVertexArray(this.vertexArray);

    this.indexBuffer = context.createIndexBuffer(INDICES);
    state.bindIndexBuffer(this.indexBuffer);
  }

  render(): void {
    const { glState, gl } = this.context;
    glState.bindVertexArray(this.vertexArray);
    glState.bindIndexBuffer(this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, INDICES.length, IndexType.UNSIGNED_BYTE, 0);
  }

  private static instance?: QuadBuffer;

  static acquire(context: GLContext): QuadBufferInstance {
    if (!QuadBuffer.instance) QuadBuffer.instance = new QuadBuffer(context);
    const qb = QuadBuffer.instance;
    qb.ref++;
    return {
      render: () => qb.render(),
      delete() {
        qb.ref--;
        if (qb.ref === 0) {
          const gl = qb.context.gl;
          gl.deleteVertexArray(qb.vertexArray);
          gl.deleteBuffer(qb.vertexBuffer);
          gl.deleteBuffer(qb.indexBuffer);
          QuadBuffer.instance = undefined;
        }
      }
    };
  }
}
