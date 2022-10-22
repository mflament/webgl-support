import {Renderer} from './Renderer';
import {GLContext} from '../GLContext';
import {FloatPointerType, IndexType} from '../GLEnums';
import {RenderState} from "./RenderState";

// language=glsl
const VERTEX_SHADER = `
    #version 300 es
    precision highp float;

    layout(location = 0) in vec2 position;
    smooth out vec2 p;
    smooth out vec2 uv;

    void main()
    {
        p = position.xy;
        uv = (position.xy + 1.0) * 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

export class QuadRenderer implements Renderer {
    static readonly VS = VERTEX_SHADER;

    readonly quadBuffer: QuadBuffer;
    private _program?: WebGLProgram;

    prepare?: (runningState: RenderState) => boolean;

    constructor(context: GLContext, fragmentShader: string, vertexShader?: string, quadBuffer?: QuadBuffer);
    constructor(context: GLContext, program: WebGLProgram, quadBuffer?: QuadBuffer);
    constructor(readonly context: GLContext, p0: string | WebGLProgram, p1?: string | QuadBuffer, quadBuffer?: QuadBuffer) {
        if (typeof p0 === 'string') {
            const vs = typeof p1 === "string" ? p1 : VERTEX_SHADER;
            context.program({fs: p0, vs}).then(p => this._program = p);
        } else
            this._program = p0;

        if (typeof p1 === "object")
            quadBuffer = p1;
        this.quadBuffer = quadBuffer || new QuadBuffer(context);
    }

    render(runningState: RenderState): void {
        if (this._program) {
            const glState = this.context.glState;
            glState.useProgram(this._program);
            if (!this.prepare || this.prepare(runningState)) {
                this.quadBuffer.render();
            }
        }
    }

    delete(): void {
        const gl = this.context.gl;
        this.quadBuffer.delete();
        this._program && gl.deleteProgram(this._program);
    }
}

// prettier-ignore
const VERTEX = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    -1.0, 1.0
]);

// prettier-ignore
const INDICES = new Uint8Array([
    0, 1, 2,
    2, 3, 0
]);


export class QuadBuffer {
    private readonly vertexArray: WebGLVertexArrayObject;
    private readonly indexBuffer: WebGLBuffer;
    private readonly vertexBuffer: WebGLBuffer;

    constructor(readonly context: GLContext) {
        const state = context.glState;
        this.vertexBuffer = context.createVertexBuffer(VERTEX);
        state.bindVertexBuffer(this.vertexBuffer);

        this.vertexArray = context.createVertexArray(builder => builder.vertexAttribPointer(2, FloatPointerType.FLOAT).build());
        state.bindVertexArray(this.vertexArray);

        this.indexBuffer = context.createIndexBuffer(INDICES);
        state.bindIndexBuffer(this.indexBuffer);
    }

    render(): void {
        const {glState, gl} = this.context;
        glState.bindVertexArray(this.vertexArray);
        glState.bindIndexBuffer(this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, INDICES.length, IndexType.UNSIGNED_BYTE, 0);
    }

    delete(): void {
        const gl = this.context.gl;
        gl.deleteVertexArray(this.vertexArray);
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }

}
