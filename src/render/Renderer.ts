import {RenderState} from "./RenderState";

export interface Renderer {

    render(state: Readonly<RenderState>): boolean | void;

    resized?(widht: number, height: number): void;

    delete?(): void;

    timer?: { speed?: number, offset?: number };

}
