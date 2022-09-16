export interface RunningState {
  /**
   * seconds elapsed since last update
   */
  readonly dt: number;
  /**
   *  seconds elapsed since unpaused
   */
  readonly time: number;
  /**
   * rendered frames since unpaused
   */
  readonly frames: number;
  /**
   *  FPS
   */
  readonly fps: number;
}

export interface Renderer {

  readonly program?: WebGLProgram;

  render(state: RunningState): void;

  resized?: (width: number, height: number) => void;

  delete?: () => void;

}
