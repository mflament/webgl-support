import {GLProgram} from "../program";

export type QuadProgramProps = { fs: string, vs: string } | { fs: string, positionAttribute?: string };

export async function createQuadProgram(gl: WebGL2RenderingContext, props: QuadProgramProps): Promise<GLProgram> {
    const glProgram = new GLProgram(gl);
    let vs;
    if ("vs" in props) vs = props.vs;
    else vs = defaultQuadVS(props.positionAttribute);
    await glProgram.compile({vs, fs: props.fs});
    return glProgram;
}

// language=glsl
function defaultQuadVS(posName = 'uv') {
    return `#version 300 es
    precision highp float;
    layout(location = 0) in vec2 position;
    out vec2 ${posName};
    void main() {
        ${posName} = (position.xy + 1.0) * 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
    }`
}