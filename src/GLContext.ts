import { Renderer, RunningState } from './Renderer';
import { check } from './GLUtils';
import { ProgramBuilder } from './ProgramBuilder';
import { GLRenderState } from './GLRenderState';
import { VertexArrayBuilder } from './VertexArrayBuilder';
import { BufferTarget, BufferUsage } from './GLEnums';
import { createTexture, DataTextureConfig, GLTexture, ImageTextureConfig, PBOTextureConfig } from './GLTexture';
import { ProgramUniformsFactory, uniformsFactory } from './ProgramUniform';
import {GLFrameBuffer} from "./GLFrameBuffer";

export class GLContext {
  readonly canvas: HTMLCanvasElement;
  readonly gl: WebGL2RenderingContext;
  readonly glState: GLRenderState;

  private readonly _resizeObserver = new ResizeObserver(() => this.onresize());

  private _renderer: Renderer = new NoopRenderer();

  private _runningState?: DefaultRunningState;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = check(this.canvas.getContext('webgl2'), 'webgl2 context');
    this.glState = new GLRenderState(this.gl);

    this.render = this.render.bind(this);
    this._resizeObserver.observe(this.canvas);
    this.onresize();
  }

  get renderer(): Renderer {
    return this._renderer;
  }

  set renderer(renderer: Renderer) {
    this._renderer.delete && this._renderer.delete();
    this._renderer = renderer;
  }

  get running(): boolean {
    return this._runningState !== undefined;
  }

  set running(r: boolean) {
    if (!r) {
      this._runningState = undefined;
    } else if (!this._runningState) {
      this._runningState = new DefaultRunningState();
      requestAnimationFrame(this.render);
    }
  }

  programBuilder(): ProgramBuilder {
    return new ProgramBuilder(this.gl);
  }

  createBuffer(target: BufferTarget, factory: (gl: WebGL2RenderingContext, buffer: WebGLBuffer) => void): WebGLBuffer {
    const { gl, glState } = this;
    const buffer = check(gl.createBuffer(), 'buffer');
    const prevBuffer = glState.bindBuffer(target, buffer);
    factory(gl, buffer);
    glState.bindBuffer(target, prevBuffer);
    return buffer;
  }

  createVertexBuffer(size: number, usage?: BufferUsage): WebGLBuffer;
  createVertexBuffer(array: ArrayBufferView, usage?: BufferUsage, offset?: number, length?: number): WebGLBuffer;
  createVertexBuffer(buffer: BufferSource | null, usage?: BufferUsage): WebGLBuffer;
  createVertexBuffer(
    source: number | ArrayBufferView | BufferSource | null,
    usage: BufferUsage = BufferUsage.STATIC_DRAW,
    offset = 0,
    length?: number
  ): WebGLBuffer {
    const target = BufferTarget.ARRAY_BUFFER;
    return this.createBuffer(target, gl => {
      if (typeof source === 'number') gl.bufferData(target, source, usage);
      else if (isArrayBufferView(source)) gl.bufferData(target, source, usage, offset, length);
      else gl.bufferData(target, source, usage);
    });
  }

  createIndexBuffer(
    indices: Uint8Array | Uint16Array | Uint32Array,
    usage: BufferUsage = BufferUsage.STATIC_DRAW
  ): WebGLBuffer {
    const target = BufferTarget.ELEMENT_ARRAY_BUFFER;
    return this.createBuffer(target, gl => gl.bufferData(target, indices, usage));
  }

  createVertexArray(factory: (builder: VertexArrayBuilder) => void): WebGLVertexArrayObject {
    const { gl, glState } = this;
    const vao = check(gl.createVertexArray(), 'vertex array');
    const prevVao = glState.bindVertexArray(vao);
    factory(new VertexArrayBuilder(gl));
    glState.bindVertexArray(prevVao);
    return vao;
  }

  createTexture(config: DataTextureConfig | ImageTextureConfig | PBOTextureConfig): GLTexture {
    return createTexture(this, config);
  }

  createFrameBuffer(): GLFrameBuffer {
    return new GLFrameBuffer(this);
  }

  programUniformsFactory(program: WebGLProgram): ProgramUniformsFactory {
    return uniformsFactory(this, program);
  }

  destroy(): void {
    this.running = false;
    this._renderer.delete && this._renderer.delete();
    this._resizeObserver.unobserve(this.canvas);
  }

  private render(dt: number): void {
    const state = this._runningState;
    if (state) {
      state.update(dt);
      this._renderer.render(state);
      requestAnimationFrame(this.render);
    } else {
      this._renderer.render({ time: 0, dt });
    }
  }

  private onresize(): void {
    const { gl, canvas } = this;
    const { clientWidth, clientHeight } = canvas;
    canvas.width = clientWidth;
    canvas.height = clientHeight;
    gl.viewport(0, 0, clientWidth, clientHeight);
    this._renderer.resized && this._renderer.resized(clientWidth, clientHeight);
    if (!this.running) this.render(0);
  }
}

class NoopRenderer implements Renderer {
  render(): void {
    // nop
  }
}

class DefaultRunningState implements RunningState {
  private startTime?: number;
  private lastTime = 0;
  dt = 0;
  time = 0;

  update(now: number): void {
    if (!this.startTime) {
      this.startTime = now;
    } else {
      this.time = (now - this.startTime) / 1000;
      this.dt = (now - this.lastTime) / 1000;
    }
    this.lastTime = now;
  }
}

function isArrayBufferView(obj: any): obj is ArrayBufferView {
  const sbv = obj as any;
  return typeof sbv.buffer === 'object' && typeof sbv.byteLength === 'number' && typeof sbv.byteOffset === 'number';
}
