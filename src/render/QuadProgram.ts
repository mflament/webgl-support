import {GLProgram, ProgramSources} from "../program";

export type QuadProgramProps = { fs: string, vs: string } | { fs: string, positionAttribute?: string };

export function createQuadProgram(gl: WebGL2RenderingContext, props: QuadProgramProps): GLProgram {
    const glProgram = new GLProgram(gl);
    const result = glProgram.compile(sources(props));
    if (result?.hasError()) throw result.formatLogs();
    return glProgram;
}

export async function createQuadProgramAsync(gl: WebGL2RenderingContext, props: QuadProgramProps): Promise<GLProgram> {
    const glProgram = new GLProgram(gl);
    const result = await glProgram.compileAsync(sources(props));
    if (result?.hasError()) throw result.formatLogs();
    return glProgram;
}

function sources(props: QuadProgramProps): ProgramSources {
    let vs;
    if ("vs" in props) vs = props.vs;
    else vs = defaultQuadVS(props.positionAttribute);
    return {vs, fs: props.fs};
}

function defaultQuadVS(posName = "uv") {
    // language=glsl
    return `#version 300 es
    precision highp float;
    layout(location = 0) in vec2 position;
    out vec2 ${posName};
    void main() {
        ${posName} = (position.xy + 1.0) * 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
    }`
}