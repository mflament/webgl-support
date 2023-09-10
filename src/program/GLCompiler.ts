import {CompilationResult} from "./CompilationResult";
import {TransformFeedbackBufferMode} from "./GLProgramEnums";
import {ProgramVaryings} from "./GLProgram";

export function createAndCompile(gl: WebGL2RenderingContext, vs: string, fs: string, varyings?: ProgramVaryings): WebGLProgram {
    const program = gl.createProgram();
    if (!program) throw new Error("createProgram");
    compile(gl, program, vs, fs, varyings);
    return program;
}

export function compile(gl: WebGL2RenderingContext, program: WebGLProgram, vs: string, fs: string, varyings?: ProgramVaryings): CompilationResult {
    const start = performance.now();
    const shaders = doCompile(gl, program, vs, fs, varyings);
    const result = createResult(gl, program, start, vs, fs, shaders);
    if (result.hasError())
        throw result.formatLogs();
    return result;
}

export async function compileAsync(gl: WebGL2RenderingContext, program: WebGLProgram, vs: string, fs: string, varyings?: ProgramVaryings): Promise<CompilationResult> {
    const extension = gl.getExtension("KHR_parallel_shader_compile");
    if (!extension)
        return compile(gl, program, vs, fs, varyings);

    const start = performance.now();
    const shaders = doCompile(gl, program, vs, fs, varyings);

    return new Promise((resolve) => {
        const check = () => {
            if (gl.getProgramParameter(program, extension.COMPLETION_STATUS_KHR) === true) {
                const result = createResult(gl, program, start, vs, fs, shaders);
                resolve(result);
            } else
                requestAnimationFrame(check);
        }
        requestAnimationFrame(check);
    });
}

function doCompile(gl: WebGL2RenderingContext, progam: WebGLProgram, vs: string, fs: string, varyings?: ProgramVaryings): WebGLShader[] {
    const createShader = (type: GLenum) => {
        const shader = gl.createShader(type);
        if (!shader) throw new Error("createShader");
        return shader;
    }

    const sources = [vs.trim(), fs.trim()];
    const shaders = [createShader(gl.VERTEX_SHADER), createShader(gl.FRAGMENT_SHADER)];
    for (let i = 0; i < shaders.length; i++) {
        const shader = shaders[i];
        if (!shader) throw new Error("Error creating shader");
        if (shader) {
            gl.attachShader(progam, shader);
            gl.shaderSource(shader, sources[i]);
            gl.compileShader(shader);
        }
    }

    if (varyings)
        gl.transformFeedbackVaryings(progam, varyings.names, varyings.bufferMode);
    else
        gl.transformFeedbackVaryings(progam, [], TransformFeedbackBufferMode.SEPARATE_ATTRIBS);

    gl.linkProgram(progam);

    return shaders;
}

function createResult(gl: WebGL2RenderingContext, program: WebGLProgram, start: number, vs: string, fs: string, shaders: WebGLShader[]): CompilationResult {
    const compileTime = performance.now() - start;
    let logs;
    const status = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!status) {
        logs = {
            vs: shaderLog(gl, shaders[0]),
            fs: shaderLog(gl, shaders[1]),
            program: gl.getProgramInfoLog(program)
        };
    }

    for (let shader of shaders)
        gl.deleteShader(shader);

    return new CompilationResult(compileTime, vs, fs, logs);
}

function shaderLog(gl: WebGL2RenderingContext, shader: WebGLShader): string | null | undefined {
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? undefined : gl.getShaderInfoLog(shader);
}
