import {Renderer, RenderState} from './render/Renderer';
import {check} from './utils/GLUtils';
import {GLState} from './GLState';
import {VertexArrayBuilder} from './buffers/VertexArrayBuilder';
import {BufferTarget, BufferUsage} from './GLEnums';
import {createTexture2D, DataTextureConfig, GLTexture, ImageTextureConfig, PBOTextureConfig} from './texture/GLTexture';
import {ProgramUniformsFactory, uniformsFactory} from './uniform/ProgramUniform';
import {GLFrameBuffer} from "./buffers/GLFrameBuffer";
import {CompiledProgram, programBuilder, ProgramBuilder, ProgramConfig} from "./program/ProgramBuilder";

export interface ObserveSizeProps {
    element: HTMLElement,
    debounce?: number | boolean;
}

export interface GLContextProps {
    canvas: HTMLCanvasElement;
    createRenderer?: (glContext: GLContext) => Renderer;
}

export class GLContext {
    readonly canvas: HTMLCanvasElement;
    readonly gl: WebGL2RenderingContext;
    readonly glState: GLState;


    private _renderer?: Renderer;
    private _lastUpdateTime?: number;
    private readonly _renderState: RenderState = {
        time: 0,
        dt: 0,
        frame: 0,
        fps: 0,
        paused: true,
        reset: () => {
            const rs = this._renderState;
            rs.time = rs.dt = rs.frame = rs.fps = 0;
            if (rs.paused) this.render();
        }
    };
    private readonly _program: ProgramBuilder;

    constructor(props: GLContextProps) {
        const {canvas, createRenderer} = props;
        this.reset = this.reset.bind(this);
        this.update = this.update.bind(this);
        this.canvas = canvas;
        this.gl = check(canvas.getContext('webgl2'), 'webgl2 context');
        this.glState = new GLState(this.gl);
        this._program = programBuilder(this);
        this._renderer = createRenderer && createRenderer(this);
        this.resized();
    }

    program(config: ProgramConfig): Promise<WebGLProgram> {
        return this._program(config).then(p => {
            p.deleteShaders();
            return p.program;
        });
    }

    compile(config: ProgramConfig): Promise<CompiledProgram> {
        return this._program(config);
    }

    resized(): boolean {
        const {canvas, gl} = this;
        const {clientWidth: width, clientHeight: height} = this.canvas;
        if (canvas.width === width && canvas.height === height)
            return false;
        canvas.width = width;
        canvas.height = height;
        const renderer = this._renderer;
        if (renderer) {
            setTimeout(() => {
                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
                this.render();
            });
        }
        return true;
    }

    private update(now: number) {
        const rs = this._renderState;
        if (rs.paused)
            return;

        const lastUpdateTime = this._lastUpdateTime || now;
        rs.dt = (now - lastUpdateTime) / 1000;
        rs.time += rs.dt;
        rs.fps = rs.time > 0 ? rs.frame / rs.time : 0;

        this.render();

        rs.frame++;
        this._lastUpdateTime = now;
        requestAnimationFrame(this.update);
    }

    private render(): void {
        this._renderer?.render(this._renderState);
    }

    get renderer(): Renderer | undefined {
        return this._renderer;
    }

    set renderer(renderer: Renderer | undefined) {
        this._renderer?.delete && this._renderer.delete();
        this._renderer = renderer;
    }

    get paused(): boolean {
        return this._renderState.paused;
    }

    resume(): void {
        const rs = this._renderState;
        if (rs.paused) {
            rs.paused = false;
            this._lastUpdateTime = undefined;
            requestAnimationFrame(this.update);
        }
    }

    pause(): void {
        const rs = this._renderState;
        if (!rs.paused)
            rs.paused = true;
    }

    toggle(): void {
        if (this.paused) this.resume();
        else this.pause();
    }

    reset(): void {
        this._renderState.reset();
    }

    get fps(): number {
        return this._renderState.frame;
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

    createTexture2D(config: DataTextureConfig | ImageTextureConfig | PBOTextureConfig): GLTexture {
        return createTexture2D(this, config);
    }

    createFrameBuffer(): GLFrameBuffer {
        return new GLFrameBuffer(this);
    }

    programUniformsFactory(program: WebGLProgram): ProgramUniformsFactory {
        return uniformsFactory(this, program);
    }

    destroy(): void {
        this._lastUpdateTime = undefined;
        this._renderer?.delete && this._renderer.delete();
    }

}

function isArrayBufferView(obj: any): obj is ArrayBufferView {
    const sbv = obj as any;
    return typeof sbv.buffer === 'object' && typeof sbv.byteLength === 'number' && typeof sbv.byteOffset === 'number';
}
