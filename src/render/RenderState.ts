export interface RenderState {
    /**
     *  seconds elapsed since start
     */
    time: number;
    /**
     * seconds elapsed since start
     */
    dt: number;
    /**
     * rendered frames since start
     */
    frame: number;
    /**
     *  Frame per sec
     */
    fps: number;
}