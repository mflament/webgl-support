export enum DrawMode {
    POINTS = WebGL2RenderingContext.POINTS,
    LINE_STRIP = WebGL2RenderingContext.LINE_STRIP,
    LINE_LOOP = WebGL2RenderingContext.LINE_LOOP,
    LINES = WebGL2RenderingContext.LINES,
    TRIANGLE_STRIP = WebGL2RenderingContext.TRIANGLE_STRIP,
    TRIANGLE_FAN = WebGL2RenderingContext.TRIANGLE_FAN,
    TRIANGLES = WebGL2RenderingContext.TRIANGLES,
}

export enum ElementArrayType {
    UNSIGNED_BYTE = WebGL2RenderingContext.UNSIGNED_BYTE,
    UNSIGNED_SHORT = WebGL2RenderingContext.UNSIGNED_SHORT,
    UNSIGNED_INT = WebGL2RenderingContext.UNSIGNED_INT,
}

export class PrimitiveRenderer {
    constructor(readonly gl: WebGL2RenderingContext) {
    }

    drawArrays(mode: DrawMode, first: number, count: number): void {
        this.gl.drawArrays(mode, first, count);
    }

    drawElements(mode: DrawMode, count: number, type: ElementArrayType, offset: number): void {
        this.gl.drawElements(mode, count, type, offset);
    }

}