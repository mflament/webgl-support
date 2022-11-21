import {RenderState} from "./RenderState";

export type TimerConfig = { speed: number, offset: number };

export interface Renderer<S extends RenderState = any> {

    timer?: TimerConfig;

    newRenderState?(): S;

    render(state: Readonly<S>): boolean | void;

    resized?(width: number, height: number): void;

    delete?(): void;

}
