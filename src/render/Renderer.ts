import {RenderState} from "./RenderState";

export interface Renderer {

    /**
     * Called each animation frame, even if paused (state will reflect this)
     * @param state the current render state
     */
    render(state: Readonly<RenderState>): void;

    /**
     * Called only if sync syze is active on controller.
     */
    onResize?(width: number, height: number): void;

    /**
     * Called when gl context is lost. The container does not need to delete GL resources, and will not be used anymore.
     */
    onContextLost?(): void;

    stop?(): void;
}
