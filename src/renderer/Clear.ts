import { Renderer, RunningState } from './Renderer';

export type Color = [number, number, number, number];

const DEFAULT_CLEAR_COLOR: Color = [0, 0, 0, 0];

export class ClearRenderer implements Renderer {
  private next?: Renderer;

  constructor(
    readonly gl: WebGL2RenderingContext,
    readonly color: Color = DEFAULT_CLEAR_COLOR,
    readonly mask = gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT
  ) {
    gl.colorMask(true, true, true, true);
    gl.clearColor(color[0], color[1], color[2], color[3]);
  }

  render(state: RunningState): void {
    this.gl.clear(this.mask);
    this.next?.render(state);
  }

  delete(): void {
    this.next?.delete && this.next.delete();
  }

  resized(width: number, height: number): void {
    this.next?.resized && this.next.resized(width, height);
  }

  then(next: Renderer): ClearRenderer {
    this.next = next;
    return this;
  }
}
