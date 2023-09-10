import {createAndCompile, createProgram, Renderer, RenderState} from "../../src";

export async function createQuadBufferSandbox(gl: WebGL2RenderingContext): Promise<Renderer> {
    const {program: renderProgram, uniformLocations} = createProgram(gl, QUAD_VS, FS, {iTime: 0});

    const program = createAndCompile(gl, CREATE_INDEX_VS, DISCARD_FS, {
        names: ['index'],
        bufferMode: gl.SEPARATE_ATTRIBS
    });

    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD_VERTICES, gl.STATIC_DRAW);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, QUAD_INDICES, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    gl.clearColor(0, 0, 0, 1);

    let storage: WebGLBuffer | null | undefined, tf: WebGLTransformFeedback | null | undefined;
    const indices = new Int32Array(6);

    function compute() {
        if (storage === undefined) {
            storage = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, storage);
            gl.bufferData(gl.ARRAY_BUFFER, indices.byteLength, gl.DYNAMIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
        if (tf === undefined) {
            tf = gl.createTransformFeedback();
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, storage);
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
        }

        gl.useProgram(program);
        // gl.bindVertexArray(vao);

        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
        gl.beginTransformFeedback(gl.POINTS);
        gl.enable(gl.RASTERIZER_DISCARD);
        gl.drawArrays(gl.POINTS, 0, indices.length);
        gl.disable(gl.RASTERIZER_DISCARD);
        gl.endTransformFeedback();
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

        gl.bindVertexArray(null);
        gl.useProgram(null);

        gl.bindBuffer(gl.ARRAY_BUFFER, storage);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.copyBufferSubData(gl.ARRAY_BUFFER, gl.ELEMENT_ARRAY_BUFFER, 0, 0, indices.byteLength);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        console.log(indices);
    }

    compute();

    return {
        render(state: Readonly<RenderState>) {
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(renderProgram);
            gl.bindVertexArray(vao);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

            gl.uniform1f(uniformLocations.iTime, state.time);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            gl.bindVertexArray(null);
            gl.useProgram(null);
        }
    }
}

const QUAD_VERTICES = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    -1.0, 1.0,
]);

const QUAD_INDICES = new Uint32Array([
    0, 1, 2,
    0, 2, 3
]);

// language=glsl
const QUAD_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec2 position;
out vec2 uv;
void main() {
    uv = (position.xy + 1.0) * 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}
`

// language=glsl
const FS = `#version 300 es
precision highp float;
in vec2 uv;
uniform float iTime;
out vec4 fragColor;
void main() {
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0, 2, 4));
    fragColor = vec4(col, 1.0);
}
`

// language=glsl
const CREATE_INDEX_VS = `#version 300 es
precision highp float;
flat out int index;
void main() {
    index = gl_VertexID;
}
`

// language=glsl
const DISCARD_FS = `#version 300 es
precision highp float;
out vec4 fragColor;
void main() {
    discard;
}
`
