export interface RenderState {

    paused: boolean;

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
     *  Frame per sec
     */
    fps: number;
}