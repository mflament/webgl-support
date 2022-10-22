import {Renderer} from './render/Renderer';
import {check} from './utils/GLUtils';
import {GLState} from './GLState';
import {VertexArrayBuilder} from './buffers/VertexArrayBuilder';
import {BufferTarget, BufferUsage} from './GLEnums';
import {CompiledProgram, ProgramBuilder, ProgramConfig} from "./program/ProgramBuilder";
import {RenderState} from "./render/RenderState";
import {
    DataTexture3DConfig,
    DataTextureConfig,
    GLTexture,
    GLTexture3D,
    GLTextures,
    ImageTextureConfig,
    PBOTexture3DConfig,
    PBOTextureConfig
} from "./texture/GLTexture";

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

    private _running = false;
    private _renderer?: Renderer;
    private _resized = true;

    private _renderedFrames = 0;
    private _renderStartTime?: number;

    private _lastUpdateTime?: number;

    private readonly _renderState: RenderState & { _absoluteTime: number } = {
        time: 0,
        dt: 0,
        frame: 0,
        fps: 0,
        paused: true,
        _absoluteTime: 0
    };
    private readonly _program: ProgramBuilder;
    private readonly _textures: GLTextures;

    constructor(props: GLContextProps) {
        const {canvas, createRenderer} = props;
        this.renderLoop = this.renderLoop.bind(this);
        this.canvas = canvas;
        this.gl = check(canvas.getContext('webgl2'), 'webgl2 context');
        this.glState = new GLState(this.gl);

        this._program = ProgramBuilder(this);
        this._textures = new GLTextures(this);
        this._renderer = createRenderer && createRenderer(this);
    }

    get fps(): number {
        return this._renderState.fps;
    }

    resize(): void {
        this._resized = true;
    }

    get renderer(): Renderer | undefined {
        return this._renderer;
    }

    set renderer(renderer: Renderer | undefined) {
        this._renderer?.delete && this._renderer.delete();
        this._renderer = renderer;
        this._resized = true;
    }

    get running(): boolean {
        return this._running;
    }

    set running(r: boolean) {
        if (!this._running && r)
            requestAnimationFrame(this.renderLoop);
        this._running = r;
    }

    reset(): void {
        const rs = this._renderState;
        rs.dt = rs.frame = rs.time = rs._absoluteTime = 0;
    }

    get paused(): boolean {
        return this._renderState.paused;
    }

    pause(): void {
        this._renderState.paused = true;
    }

    resume(): void {
        if (this.paused) {
            this._renderState.paused = false;
            this._lastUpdateTime = undefined;
        }
    }

    toggle(): void {
        if (this.paused) this.resume();
        else this.pause();
    }

    //////// factories

    program(config: ProgramConfig): Promise<WebGLProgram> {
        return this._program(config).then(p => {
            p.deleteShaders();
            return p.program;
        });
    }

    compile(config: ProgramConfig): Promise<CompiledProgram> {
        return this._program(config);
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

    destroy(): void {
        this._lastUpdateTime = undefined;
        this._renderer?.delete && this._renderer.delete();
    }

    createTexture(config: DataTextureConfig | ImageTextureConfig | PBOTextureConfig): GLTexture;
    createTexture(config: DataTexture3DConfig | PBOTexture3DConfig): GLTexture3D;
    createTexture(config: DataTextureConfig | ImageTextureConfig | PBOTextureConfig | DataTexture3DConfig | PBOTexture3DConfig): GLTexture | GLTexture3D {
        return this._textures.createTexture(config);
    }

    updateTexture(texture: GLTexture3D, config: DataTexture3DConfig | PBOTexture3DConfig): GLTexture3D;
    updateTexture(texture: GLTexture, config: DataTextureConfig | ImageTextureConfig | PBOTextureConfig): GLTexture;
    updateTexture(texture: GLTexture | GLTexture3D, config: DataTextureConfig | ImageTextureConfig | PBOTextureConfig | DataTexture3DConfig | PBOTexture3DConfig): GLTexture | GLTexture3D {
        return this._textures.updateTexture(texture, config);
    }

////////////// private

    private renderLoop(now: number) {
        if (!this._running)
            return;

        const renderer = this._renderer;
        this.updateSize();

        const rs = this._renderState;
        if (this._renderStartTime === undefined)
            this._renderStartTime = now;

        const time = (now - this._renderStartTime) / 1000;
        rs.fps = time > 0 ? this._renderedFrames / time : 0;

        if (renderer) {
            const timer = renderer.timer;
            if (!rs.paused) {
                const lastUpdateTime = this._lastUpdateTime === undefined ? now : this._lastUpdateTime;
                const speed = timer?.speed === undefined ? 1 : timer.speed;
                rs.dt = (now - lastUpdateTime) / 1000 * speed;
                rs._absoluteTime += rs.dt;
            }

            const offset = timer?.offset === undefined ? 0 : timer.offset;
            rs.time = offset + rs._absoluteTime;

            renderer.render(rs);

            if (!rs.paused) {
                rs.frame++;
                this._lastUpdateTime = now;
            }
        }

        this._renderedFrames++;
        requestAnimationFrame(this.renderLoop);
    }

    private updateSize(): void {
        const {canvas, gl} = this;
        const {clientWidth: width, clientHeight: height} = this.canvas;
        if (this._resized || canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            if (this._renderer?.resized)
                this._renderer.resized(width, height);
            this._resized = false;
        }
    }

}

function isArrayBufferView(obj: any): obj is ArrayBufferView {
    const sbv = obj as any;
    return typeof sbv.buffer === 'object' && typeof sbv.byteLength === 'number' && typeof sbv.byteOffset === 'number';
}
