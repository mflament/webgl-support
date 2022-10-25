import {QuadBuffer, Renderer, RenderState} from './render';
import {check} from './utils';

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

    private _running = false;
    private _renderer?: Renderer;
    private _resized = true;

    private _renderedFrames = 0;
    private _renderStartTime?: number;

    private _lastUpdateTime?: number;

    private _quadBuffer?: QuadBuffer;

    private readonly _renderState: RenderState & { _absoluteTime: number } = {
        time: 0,
        dt: 0,
        frame: 0,
        fps: 0,
        paused: true,
        _absoluteTime: 0
    };

    constructor(props: GLContextProps) {
        const {canvas, createRenderer} = props;
        this.renderLoop = this.renderLoop.bind(this);
        this.canvas = canvas;
        this.gl = check(canvas.getContext('webgl2'), 'webgl2 context');
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

    start() {
        if (!this._running) {
            this._running = true;
            this._renderState.paused = false;
            this._lastUpdateTime = undefined;
            requestAnimationFrame(this.renderLoop);
        }
    }

    stop() {
        this._running = false;
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

    get quadBuffer(): QuadBuffer {
        if (!this._quadBuffer)
            this._quadBuffer = new QuadBuffer(this.gl);
        return this._quadBuffer;
    }

    delete(): void {
        this._lastUpdateTime = undefined;
        this._quadBuffer && this._quadBuffer.delete();
        this._renderer?.delete && this._renderer.delete();
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