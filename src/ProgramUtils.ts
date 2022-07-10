import {check} from './GLUtils';
import {VaryingBufferMode} from './GLEnums';

export type Varyings = { names: string[], bufferMode: VaryingBufferMode };

export interface ProgramParams {
    readonly fragmenShader: string;
    readonly vertexShader: string;
    readonly varyings?: Varyings
}

export class ProgramError {
    constructor(readonly status: number, readonly log: string | null) {
    }
}

export class ProgramResult {
    constructor(readonly params: ProgramParams,
                readonly program?: WebGLProgram,
                readonly vsError?: ProgramError,
                readonly fsError?: ProgramError,
                readonly programError?: ProgramError) {
    }
}

export function createProgram(gl: WebGL2RenderingContext, params: ProgramParams): ProgramResult {
    if (!params.vertexShader) throw new Error('No vertex shader');
    if (!params.fragmenShader) throw new Error('No fragment shader');

    const program = check(gl.createProgram(), 'program');

    const vs = createShader(gl, params.vertexShader, gl.VERTEX_SHADER);
    const fs = createShader(gl, params.fragmenShader, gl.FRAGMENT_SHADER);
    const vsError = vs instanceof ProgramError ? vs : undefined;
    const fsError = fs instanceof ProgramError ? fs : undefined;
    if (vsError || fsError) {
        if (!vsError) gl.deleteShader(vs);
        if (!fsError) gl.deleteShader(fs);
        gl.deleteProgram(program);
        return new ProgramResult(params, undefined, vsError, fsError, undefined);
    }

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
        return new ProgramResult(params, undefined, undefined, undefined, new ProgramError(status, log));
    }
    return new ProgramResult(params, program);
}

function createShader(gl: WebGL2RenderingContext, source: string, type: number): WebGLShader | ProgramError {
    const shader = check(gl.createShader(type), 'shader');
    source = source.trimStart();
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!status) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        return new ProgramError(status, log);
    }
    return shader;
}
