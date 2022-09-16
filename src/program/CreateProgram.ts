import {check} from '../utils/GLUtils';
import {VaryingBufferMode} from '../GLEnums';

export type Varyings = { names: string[], bufferMode: VaryingBufferMode };

export interface ProgramParams {
    readonly fragmenShader: string;
    readonly vertexShader: string;
    readonly varyings?: Varyings
}

export class CreateProgramError extends Error {
    constructor(readonly status: number, readonly log: string | null) {
        super(`Error ${status} building program\n${log}`);
    }
}

export function createProgram(gl: WebGL2RenderingContext, params: ProgramParams): WebGLProgram {
    if (!params.vertexShader) throw new Error('No vertex shader');
    if (!params.fragmenShader) throw new Error('No fragment shader');

    const vs = createShader(gl, params.vertexShader, gl.VERTEX_SHADER);
    const fs = createShader(gl, params.fragmenShader, gl.FRAGMENT_SHADER);

    const program = check(gl.createProgram(), 'program');
    [vs, fs].forEach(shader => {
        gl.attachShader(program, shader);
        gl.deleteShader(shader);
    });

    if (params.varyings)
        gl.transformFeedbackVaryings(program, params.varyings.names, params.varyings.bufferMode);

    gl.linkProgram(program);
    const status = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!status) {
        const log = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new CreateProgramError(status, log);
    }
    return program;
}

function createShader(gl: WebGL2RenderingContext, source: string, type: number): WebGLShader {
    const shader = check(gl.createShader(type), 'shader');
    source = source.trimStart();
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!status) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new CreateProgramError(status, log);
    }
    return shader;
}
