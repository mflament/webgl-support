import {GLContext, GLProgram} from "../../../src";

// language=glsl
const VS = `
    #version 300 es
    precision highp float;
    flat out int vertexID;

    void main() {
        vertexID = gl_VertexID;
        gl_Position = vec4(0.0, 0.0, 1.0 - float(gl_VertexID) / 9.0, 1.0);
        gl_PointSize = 20.0;
    }
`

// language=glsl
const RENDER_FS = `
    #version 300 es
    precision highp float;

    flat in int vertexID;

    out vec4 color;

    void main() {
        //color = vec4(1.0, 0.0, 0.0, 1.0);
        color = vec4(float(vertexID) / 9.0, 0.0, 0.0, 1.0);
    }
`

export async function createAnotherSandbox(glc: GLContext) {
    const {gl} = glc;

    const program = new GLProgram(gl);
    const cr = await program.compileAsync({vs: VS, fs: RENDER_FS});
    if (cr.hasError()) throw cr.formatLogs();

    program.use();
    gl.enable(gl.DEPTH_TEST);

    // const vbo = new GLBuffer(gl);
    // vbo.bind(BufferTarget.ARRAY_BUFFER);
    // const data = new Float32Array([-0.5, -0.5, 0, 0.5, 0.5, 0]);
    // vbo.bufferData(data, BufferUsage.STATIC_DRAW);
    // vbo.unbind(BufferTarget.ARRAY_BUFFER);
    //
    // const vao = new GLVertexArray(gl);
    // vao.bind();
    // vao.vertexAttribPointer(vbo, 0, 3, FloatAttributeType.FLOAT, false, 0, 0);
    // vao.unbind();

    // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    return {
        render() {
            program.use();
            // vao.bind();
            gl.drawArrays(gl.POINTS, 0, 10);
        }
    };
}