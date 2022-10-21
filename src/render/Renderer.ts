export interface RenderState {
    /**
     * seconds elapsed since last update
     */
    dt: number;
    /**
     *  seconds elapsed since unpaused
     */
    time: number;
    /**
     * rendered frames since unpaused
     */
    frame: number;
    /**
     *  FPS
     */
    fps: number;

    paused: boolean;

    reset(): void;
}

export interface Renderer {

    render(state: Readonly<RenderState>): void;

    delete?: () => void;

}
