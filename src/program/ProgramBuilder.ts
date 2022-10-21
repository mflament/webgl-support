import {check} from '../utils/GLUtils';
import {glConstantName, VaryingBufferMode} from '../GLEnums';
import {GLContext} from "../GLContext";

export type Varyings = { names: string[], bufferMode: VaryingBufferMode };

export interface ProgramConfig {
    readonly fs: string;
    readonly vs: string;
    readonly varyings?: Varyings
}

export interface CompiledProgram {
    config: ProgramConfig;
    program: WebGLProgram;
    vs: WebGLShader;
    fs: WebGLShader;
    compileTime: number;

    delete(): void;

    deleteShaders(): void;
}

export type ProgramBuilder = (config: ProgramConfig) => Promise<CompiledProgram>;

export class ProgramError extends Error {
    constructor(message: string, readonly status: number, readonly log: string | null) {
        super(message);
    }
}

export function programBuilder(glContext: GLContext): ProgramBuilder {
    const extension = glContext.gl.getExtension("KHR_parallel_shader_compile");
    return config => {
        if (!config.vs || !config.fs)
            throw new Error('Invalid program config' + JSON.stringify(config));

        const gl = glContext.gl;
        const program = check(gl.createProgram(), 'program');
        const start = performance.now();
        const vs = createShader(gl, config.vs, gl.VERTEX_SHADER);
        gl.attachShader(program, vs);

        const fs = createShader(gl, config.fs, gl.FRAGMENT_SHADER);
        gl.attachShader(program, fs);

        if (config.varyings)
            gl.transformFeedbackVaryings(program, config.varyings.names, config.varyings.bufferMode);

        gl.linkProgram(program);

        function createResult() {
            const compileTime = performance.now() - start;
            const status = gl.getProgramParameter(program, gl.LINK_STATUS);
            if (!status) {
                const log = gl.getProgramInfoLog(program);
                const message = ["Error linking program " + glConstantName(gl, status),
                    "----------- vertex shader -----------",
                    config.vs,
                    "----------- fragment shader -----------",
                    config.fs,
                    "----------- log -----------",
                    log
                ].join("\n");
                throw new ProgramError(message, status, log);
            }

            return {
                config, program, vs, fs, compileTime,
                delete() {
                    this.deleteShaders();
                    gl.deleteProgram(program);
                },
                deleteShaders() {
                    gl.deleteShader(vs);
                    gl.deleteShader(fs);
                }
            }
        }

        if (!extension)
            return Promise.resolve(createResult());

        return new Promise(resolve => requestAnimationFrame(function check() {
            if (gl.getProgramParameter(program, extension.COMPLETION_STATUS_KHR))
                resolve(createResult());
            else
                requestAnimationFrame(check);
        }));
    }
}

function createShader(gl: WebGL2RenderingContext, source: string, type: number): WebGLShader {
    const shader = check(gl.createShader(type), 'shader');
    source = source.trimStart();
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}
