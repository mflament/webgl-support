import {Renderer, RenderState} from './render';
import {check} from './utils';

export interface GLContextProps {
    canvas: HTMLCanvasElement;
    syncSize?: boolean | number;
}

function newRenderState(): RenderState {
    return {time: 0, dt: 0, fps: 0, frame: 0};
}

export class GLContext {

    readonly canvas: HTMLCanvasElement;
    readonly gl: WebGL2RenderingContext;

    private _renderer?: Renderer;

    private _fpsCounter?: { start: number, frames: number };

    private _resizeObserver?: ResizeObserver;

    private _renderState: RenderState = newRenderState();

    private _lastUpdateTime?: number;
    private _elapsedTime = 0;

    constructor(props: GLContextProps) {
        const {canvas, syncSize} = props;
        this.renderLoop = this.renderLoop.bind(this);
        this.canvas = canvas;
        this.gl = check(canvas.getContext('webgl2'), 'webgl2 context');

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        this.gl.viewport(0, 0, canvas.width, canvas.height);

        if (syncSize !== undefined)
            this.observeSize(syncSize);
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

    get renderer(): Renderer | undefined {
        return this._renderer;
    }

    get renderState(): RenderState {
        return this._renderState;
    }

    set renderer(renderer: Renderer | undefined) {
        const wasRunning = this._renderer;
        this._renderer?.delete && this._renderer.delete();

        this._renderer = renderer;

        if (renderer) {
            this._renderState = renderer.newRenderState ? renderer.newRenderState() : newRenderState();
            renderer.resized && renderer.resized(this.canvas.width, this.canvas.height);
            if (!wasRunning) {
                this._lastUpdateTime = undefined;
                requestAnimationFrame(this.renderLoop);
            }
        }
    }

    get running(): boolean {
        return !!this._renderer;
    }

    reset(): void {
        const rs = this._renderState;
        rs.dt = rs.frame = rs.time = this._elapsedTime = 0;
    }

    delete(): void {
        this._lastUpdateTime = undefined;
        this._renderer?.delete && this._renderer.delete();
        this._resizeObserver && this._resizeObserver.disconnect();
    }

////////////// private

    private renderLoop(now: number) {
        const renderer = this._renderer;
        if (!renderer)
            return;

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

        const timer = renderer.timer;

        const lastUpdateTime = this._lastUpdateTime === undefined ? now : this._lastUpdateTime;
        const speed = timer?.speed === undefined ? 1 : timer.speed;
        rs.dt = (now - lastUpdateTime) / 1000 * speed;
        this._elapsedTime += rs.dt;

        const offset = timer?.offset === undefined ? 0 : timer.offset;
        rs.time = offset + this._elapsedTime;

        if (renderer.render(rs))
            rs.frame++;
        this._lastUpdateTime = now;

        fpsCounter.frames++;
        requestAnimationFrame(this.renderLoop);
    }

    private observeSize(syncSize: number | boolean): void {
        const updateSize = (entries: ResizeObserverEntry[]) => {
            const contentRect = entries[0].contentRect;
            const width = Math.floor(contentRect.width);
            const height = Math.floor(contentRect.height);
            this.resize(width, height);
        }
        let observerCallback = updateSize;
        if (typeof syncSize === "number" && syncSize > 0) {
            const debounceDelay = syncSize;
            let tid: number | undefined = undefined;
            observerCallback = entries => {
                if (tid !== undefined) clearTimeout(tid);
                tid = self.setTimeout(() => updateSize(entries), debounceDelay);
            }
        }
        const observer = this._resizeObserver = new ResizeObserver(observerCallback);
        observer.observe(this.canvas);
    }


}