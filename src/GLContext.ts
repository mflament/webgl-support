import {Renderer, RunningState} from './Renderer';
import {check} from './GLUtils';
import {GLRenderState} from './GLRenderState';
import {VertexArrayBuilder} from './VertexArrayBuilder';
import {BufferTarget, BufferUsage} from './GLEnums';
import {createTexture, DataTextureConfig, GLTexture, ImageTextureConfig, PBOTextureConfig} from './GLTexture';
import {ProgramUniformsFactory, uniformsFactory} from './ProgramUniform';
import {GLFrameBuffer} from "./GLFrameBuffer";

export class GLContext {
    readonly canvas: HTMLCanvasElement;
    readonly gl: WebGL2RenderingContext;
    readonly glState: GLRenderState;

    private readonly _resizeObserver = new ResizeObserver(() => this.onresize());

    private _renderer: Renderer = new NoopRenderer();

    private readonly _runningState = new DefaultRunningState();
    private _resized = false;
    private _destroyed = false;

    constructor(canvas?: HTMLCanvasElement) {
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'glcanvas';
            document.body.append(canvas);
        }
        this.canvas = canvas;
        this.gl = check(this.canvas.getContext('webgl2'), 'webgl2 context');
        this.glState = new GLRenderState(this.gl);

        this._resizeObserver.observe(this.canvas);
        this.onresize();

        const state = this._runningState;
        const render = (dt: number): void => {
            if (this._destroyed)
                return;
            if (!state.paused || this._resized) {
                !state.paused && state.update(dt);
                this._renderer.render(state);
                this._resized = false;
            }
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
    }

    get runingState(): RunningState {
        return this._runningState;
    }

    get renderer(): Renderer {
        return this._renderer;
    }

    set renderer(renderer: Renderer) {
        this._renderer.delete && this._renderer.delete();
        this._renderer = renderer;
    }

    get paused(): boolean {
        return this._runningState.paused;
    }

    pause(): void {
        this._runningState.paused = true;
    }

    resume(): void {
        this._runningState.paused = false;
    }

    toggle(): void {
        this._runningState.paused = !this._runningState.paused;
    }

    reset(): void {
        this._runningState.reset();
    }

    createBuffer(target: BufferTarget, factory: (gl: WebGL2RenderingContext, buffer: WebGLBuffer) => void): WebGLBuffer {
        const {gl, glState} = this;
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
        const {gl, glState} = this;
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

    get fps(): number {
        return this._runningState.fps;
    }

    programUniformsFactory(program: WebGLProgram): ProgramUniformsFactory {
        return uniformsFactory(this, program);
    }

    destroy(): void {
        this._renderer.delete && this._renderer.delete();
        this._resizeObserver.unobserve(this.canvas);
        this._destroyed = true;
    }

    private onresize(): void {
        const {gl, canvas} = this;
        const {clientWidth, clientHeight} = canvas;
        canvas.width = clientWidth;
        canvas.height = clientHeight;
        gl.viewport(0, 0, clientWidth, clientHeight);
        this._renderer.resized && this._renderer.resized(clientWidth, clientHeight);
        this._resized = true;
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
    private _paused = true;
    private _frames = 0;
    private _time = 0;
    private _dt = 0;

    get time(): number {
        return this._time;
    }

    get dt(): number {
        return this._dt;
    }

    get paused(): boolean {
        return this._paused;
    }

    set paused(p: boolean) {
        this._paused = p;
        if (!this._paused) this.startTime = undefined;
    }

    get frames(): number {
        return this._frames;
    }

    get fps(): number {
        if (this._time === 0)
            return 0;
        return this._frames / this._time;
    }

    reset(): void {
        this.startTime = undefined;
        this._frames = 0;
        this._time = 0;
    }

    update(now: number): void {
        if (this.startTime === undefined) {
            this.startTime = now;
            this._dt = 0;
        } else {
            this._dt = (now - this.lastTime) / 1000;
            this._time += this._dt;
        }
        this._frames++;
        this.lastTime = now;
    }

}

function isArrayBufferView(obj: any): obj is ArrayBufferView {
    const sbv = obj as any;
    return typeof sbv.buffer === 'object' && typeof sbv.byteLength === 'number' && typeof sbv.byteOffset === 'number';
}
