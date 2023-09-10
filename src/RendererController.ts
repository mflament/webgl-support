import {Renderer, RenderState} from "./render";
import {ElementSizeObserver} from "./ElementSizeObserver";
import {createGLTimerQuery, GLTimerQuery} from "./GLTimerQuery";

export interface RendererControllerState {
    speed: number;
    timeOffset: number;
}

function defaultRenderState(): RenderState {
    return {time: 0, dt: 0, fps: 0, frame: 0};
}

export type RendererFactory<R extends Renderer = Renderer> = (gl: WebGL2RenderingContext, controller: RendererController) => R | Promise<R>;

export interface EXT_disjoint_timer_query_webgl2 {
    readonly QUERY_COUNTER_BITS_EXT: GLenum;
    readonly TIME_ELAPSED_EXT: GLenum;
    readonly TIMESTAMP_EXT: GLenum;
    readonly GPU_DISJOINT_EXT: GLenum;

    queryCounterEXT(query: WebGLQuery, target: GLenum): void;
}

export type RendererListener<R extends Renderer = any> = (renderer?: R) => void;

export class RendererController<R extends Renderer = any> {

    private readonly _gl: WebGL2RenderingContext;
    private _renderer?: R;

    private _renderState = defaultRenderState();

    /**
     * Time factor
     */
    private _speed = 1;

    /**
     * time offset (in seconds)
     */
    private _timeOffset = 0;

    private _timers?: {
        lastRenderTime: number,
        elapsedSecs: number,
        fps: {
            start: number,
            frames: number
        }
    };

    // debounce time for canvas resize event, < 0 : no size event, 0: no debounce, > 0 : debound millis
    private _elementSizeObserver?: ElementSizeObserver;
    private _resized = true;

    onResize?: (width: number, height: number) => void;

    private readonly contextLost: () => void;
    private readonly contextRestored: () => Promise<void>;
    private readonly glTimerQuery?: GLTimerQuery;

    private readonly rendererListeners: RendererListener[] = [];

    constructor(readonly canvas: HTMLCanvasElement, readonly rendererFactory: RendererFactory<R>, sizeObserverDebounce = 20) {
        const gl = canvas.getContext('webgl2');
        if (!gl)
            throw new Error("No webgl2 context");
        this._gl = gl;
        this.glTimerQuery = createGLTimerQuery(gl);

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        this.contextLost = () => {
            if (this._renderer?.onContextLost)
                this._renderer.onContextLost();
            this._renderer = undefined;
            this.rendererListeners.forEach(l => l(undefined));
        }
        this.contextRestored = async () => {
            this._renderer = await rendererFactory(gl, this);
            this.rendererListeners.forEach(l => l(this._renderer));
            this.startRenderer(this._renderer);
        };
        this.sizeObserverDebounce = sizeObserverDebounce;
    }

    start() {
        const {canvas} = this;
        canvas.addEventListener('webglcontextlost', this.contextLost, false);
        canvas.addEventListener('webglcontextrestored', this.contextRestored, false);
        return this.contextRestored();
    }

    stop() {
        if (this._renderer) {
            this._renderer.stop && this._renderer.stop();
            this._renderer = undefined;
        }
    }

    get renderer(): R | undefined {
        return this._renderer;
    }

    get renderState(): RenderState {
        return this._renderState || defaultRenderState();
    }

    get controllerState(): RendererControllerState {
        return {speed: this._speed, timeOffset: this._timeOffset};
    }

    set controllerState(state: RendererControllerState) {
        this._speed = state.speed;
        this._timeOffset = state.timeOffset;
    }

    get speed(): number {
        return this._speed;
    }

    set speed(s: number) {
        this._speed = s;
    }

    get timeOffset(): number {
        return this._timeOffset;
    }

    set timeOffset(to: number) {
        this._timeOffset = to;
    }

    reset(): void {
        const rs = this._renderState;
        if (rs)
            rs.dt = rs.frame = rs.time = 0;
        this._speed = 1;
        this._timeOffset = 0;
        this._timers = undefined;
    }

    get sizeObserverDebounce() {
        const observer = this._elementSizeObserver;
        return observer ? observer.debounceMillis : -1;
    }

    set sizeObserverDebounce(debounceMillis: number) {
        const observer = this._elementSizeObserver;
        if (debounceMillis < 0 && observer) {
            observer.disconnect();
            this._elementSizeObserver = undefined;
        } else if (debounceMillis >= 0) {
            if (!observer)
                this._elementSizeObserver = new ElementSizeObserver(this.canvas, () => this._resized = true, debounceMillis);
            else
                observer.debounceMillis = debounceMillis;
        }
    }

    addRendererListeners(listener: RendererListener) {
        this.rendererListeners.push(listener);
    }

    removeRendererListeners(listener: RendererListener) {
        const idx = this.rendererListeners.indexOf(listener);
        if (idx >= 0) this.rendererListeners.splice(idx, 1)
    }

    private resize() {
        const canvas = this.canvas;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        const onResize = this._renderer?.onResize;
        if (onResize)
            onResize.call(this._renderer, canvas.width, canvas.height);
        else
            this._gl.viewport(0, 0, canvas.width, canvas.height);
    }

    private startRenderer(renderer: R) {
        const render = (now: number) => {
            if (this._renderer === renderer) {
                requestAnimationFrame(render);
                this.render(renderer, now);
            }
        }
        requestAnimationFrame(render);
    }

    pick?: (jsTime: number, glTime?: number) => void;

    private render(renderer: Renderer, now: number) {
        const {_timeOffset: timeOffset, _renderState: rs, speed, pick, glTimerQuery} = this;

        let timers = this._timers;
        if (!timers)
            timers = this._timers = {elapsedSecs: 0, fps: {start: now, frames: 0}, lastRenderTime: now};

        this.updateFPS(timers.fps, now);

        if (this._resized) {
            this.resize();
            this._resized = false;
        }

        const dt = (now - timers.lastRenderTime) / 1000 * speed;
        timers.elapsedSecs += dt;
        rs.dt = dt;
        rs.time = timeOffset + timers.elapsedSecs;

        if (pick) {
            const start = performance.now();
            glTimerQuery?.start();
            renderer.render(rs);
            const renderTime = performance.now() - start;
            if (glTimerQuery)
                glTimerQuery.stop(glTime => pick(renderTime, glTime));
            else
                pick(renderTime);
            this.pick = undefined;
        } else {
            renderer.render(rs);
        }

        rs.frame++;
        timers.lastRenderTime = now;
        timers.fps.frames++;
    }

    private updateFPS(fps: { start: number, frames: number }, now: number) {
        let {start, frames} = fps
        const fpsElapsed = now - start;
        if (fpsElapsed > 1000) {
            this._renderState.fps = frames / (fpsElapsed / 1000);
            fps.start = now;
            fps.frames = 0;
        }
    }

}

