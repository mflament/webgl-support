import {QuadBuffer, Renderer, RenderState} from './render';
import {check} from './utils';

export interface GLContextProps {
    canvas: HTMLCanvasElement;
    createRenderer?: (glContext: GLContext) => Renderer;
    syncSize?: boolean | number;
}

export class GLContext {
    readonly canvas: HTMLCanvasElement;
    readonly gl: WebGL2RenderingContext;

    private _running = false;
    private _renderer?: Renderer;

    private _fpsCounter?: { start: number, frames: number };

    private _lastUpdateTime?: number;

    private _quadBuffer?: QuadBuffer;

    private readonly _resizeObserver?: ResizeObserver;

    private readonly _renderState: RenderState & { _absoluteTime: number } = {
        time: 0,
        dt: 0,
        frame: 0,
        fps: 0,
        _absoluteTime: 0
    };

    constructor(readonly props: GLContextProps) {
        const {canvas, createRenderer} = props;
        this.renderLoop = this.renderLoop.bind(this);
        this.canvas = canvas;
        this.gl = check(canvas.getContext('webgl2'), 'webgl2 context');
        this._renderer = createRenderer && createRenderer(this);
        if (props.syncSize !== undefined) {
            const updateSize = (entries: ResizeObserverEntry[]) => {
                const contentRect = entries[0].contentRect;
                const width = Math.floor(contentRect.width);
                const height = Math.floor(contentRect.height);
                this.resize(width, height);
            }
            let observerCallback = updateSize;
            if (typeof props.syncSize === "number" && props.syncSize > 0) {
                const debounceDelay = props.syncSize;
                let tid: number | undefined = undefined;
                observerCallback = entries => {
                    if (tid !== undefined) clearTimeout(tid);
                    tid = self.setTimeout(() => updateSize(entries), debounceDelay);
                }
            }
            const observer = this._resizeObserver = new ResizeObserver(observerCallback);
            observer.observe(canvas);
        }
    }

    get fps(): number {
        return this._renderState.fps;
    }

    resize(width: number, height: number): void {
        const canvas = this.canvas;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            this.gl.viewport(0, 0, width, height);
            if (this._renderer?.resized)
                this._renderer.resized(width, height);
        }
    }

    get renderState(): RenderState {
        return this._renderState;
    }

    get renderer(): Renderer | undefined {
        return this._renderer;
    }

    set renderer(renderer: Renderer | undefined) {
        this._renderer?.delete && this._renderer.delete();
        this._renderer = renderer;
        this._renderer?.resized && this._renderer?.resized(this.canvas.width, this.canvas.height);
    }

    get running(): boolean {
        return this._running;
    }

    start() {
        if (!this._running) {
            this._running = true;
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

    get quadBuffer(): QuadBuffer {
        if (!this._quadBuffer)
            this._quadBuffer = new QuadBuffer(this.gl);
        return this._quadBuffer;
    }

    delete(): void {
        this._lastUpdateTime = undefined;
        this._quadBuffer && this._quadBuffer.delete();
        this._renderer?.delete && this._renderer.delete();
        this._resizeObserver && this._resizeObserver.disconnect();
    }

////////////// private

    private renderLoop(now: number) {
        if (!this._running)
            return;

        const renderer = this._renderer;

        const rs = this._renderState;
        let fpsCounter = this._fpsCounter;
        if (!fpsCounter) {
            fpsCounter = this._fpsCounter = {frames: 0, start: now};
        } else {
            const time = (now - fpsCounter.start) / 1000;
            rs.fps = fpsCounter.frames / time;
            if (time > 1) {
                fpsCounter.start = now;
                fpsCounter.frames = 0;
            }
        }

        if (renderer) {
            const timer = renderer.timer;

            const lastUpdateTime = this._lastUpdateTime === undefined ? now : this._lastUpdateTime;
            const speed = timer?.speed === undefined ? 1 : timer.speed;
            rs.dt = (now - lastUpdateTime) / 1000 * speed;
            rs._absoluteTime += rs.dt;

            const offset = timer?.offset === undefined ? 0 : timer.offset;
            rs.time = offset + rs._absoluteTime;

            if (renderer.render(rs))
                rs.frame++;
            this._lastUpdateTime = now;
        }

        fpsCounter.frames++;
        requestAnimationFrame(this.renderLoop);
    }


}