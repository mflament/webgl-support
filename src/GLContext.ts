import {Renderer, RunningState} from './render/Renderer';
import {Array, check} from './utils/GLUtils';
import {GLState} from './GLState';
import {VertexArrayBuilder} from './buffers/VertexArrayBuilder';
import {BufferTarget, BufferUsage} from './GLEnums';
import {createTexture, DataTextureConfig, GLTexture, ImageTextureConfig, PBOTextureConfig} from './texture/GLTexture';
import {ProgramUniformsFactory, uniformsFactory} from './uniform/ProgramUniform';
import {GLFrameBuffer} from "./buffers/GLFrameBuffer";

type GLContextEventType = 'resize' | 'render';

export interface GLContextEvent {
    readonly source: GLContext;
    readonly type: GLContextEventType;
}

type GLContextEventListener = (e: GLContextEvent) => void;

export interface ObserveSizeProps {
    element: HTMLElement,
    debounce?: number | boolean;
}

export interface GLContextProps {
    canvas?: HTMLCanvasElement;
}

export class GLContext {
    readonly canvas: HTMLCanvasElement;
    readonly gl: WebGL2RenderingContext;
    readonly glState: GLState;

    private _renderer: Renderer = new NoopRenderer();

    private readonly _runningState = new DefaultRunningState();
    private _destroyed = false;

    private readonly _listeners = {
        'resize': [] as GLContextEventListener[],
        'render': [] as GLContextEventListener[]
    };

    constructor(props?: GLContextProps) {
        let canvas = props?.canvas;
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'glcanvas';
            document.body.append(canvas);
        }

        this.canvas = canvas;
        this.gl = check(this.canvas.getContext('webgl2'), 'webgl2 context');
        this.glState = new GLState(this.gl);

        const state = this._runningState;
        const render = (time: number): void => {
            if (this._destroyed)
                return;

            let needRedraw = this.updateSize();
            if (!this.paused) {
                state.update(time);
                needRedraw = true;
            }

            if (needRedraw) {
                this._renderer.render(state);
                this.fireEvent('render');
            }

            state.addFrame(time);
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
    }

    addEventListener(type: GLContextEventType, listener: GLContextEventListener): () => void {
        this._listeners[type].push(listener);
        return () => this.removeEventListener(type, listener);
    }

    removeEventListener(type: GLContextEventType, listener: GLContextEventListener): void {
        Array.remove(listener, this._listeners[type]);
    }

    private updateSize(force = false): boolean {
        const {canvas, gl} = this;
        if (!force && canvas.width === canvas.clientWidth && canvas.height === canvas.clientHeight)
            return false;

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        this.fireEvent('resize');
        this._renderer?.resized && this._renderer?.resized(canvas.width, canvas.height);

        return true;
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
        this._destroyed = true;
    }

    private fireEvent(type: GLContextEventType): void {
        const listeners = this._listeners[type];
        if (listeners.length > 0) {
            const event: GLContextEvent = {source: this, type: type};
            listeners.forEach(l => l(event));
        }
    }

}

class NoopRenderer implements Renderer {
    render(): void {
        // nop
    }
}

class DefaultRunningState implements RunningState {

    private readonly startTime = performance.now();
    private _lastFpsReset = this.startTime;

    private _frames = 0;
    private _fps = 0;

    private _lastTime?: number;
    private _time = 0;
    private _dt = 0;

    constructor() {
    }

    get time(): number {
        return this._time;
    }

    get dt(): number {
        return this._dt;
    }

    get paused(): boolean {
        return this._lastTime === undefined;
    }

    set paused(p: boolean) {
        if (p != this.paused) {
            if (!p) {
                this._time = 0;
                this._lastTime = undefined;
            } else {
                this._lastTime = performance.now();
            }
        }
    }

    get frames(): number {
        return this._frames;
    }

    get fps(): number {
        return this._fps;
    }

    update(now: number): void {
        this._dt = (this._lastTime ? now - this._lastTime : 0) / 1000;
        this._time += this._dt;
        this._lastTime = now;
    }

    addFrame(now: number): void {
        const dt = (performance.now() - this._lastFpsReset) / 1000;
        if (dt > 1) {
            this._fps = this._frames / dt;
            this._frames = 0;
            this._lastFpsReset = now;
        }
        this._frames++;
    }
}

function isArrayBufferView(obj: any): obj is ArrayBufferView {
    const sbv = obj as any;
    return typeof sbv.buffer === 'object' && typeof sbv.byteLength === 'number' && typeof sbv.byteOffset === 'number';
}
