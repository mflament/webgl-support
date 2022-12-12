import {CompilationResult, ProgramSources} from "./CompilationResult";
import {check} from "../utils";
import {TransformFeedbackBufferMode} from "./GLProgramEnums";
import {GLProgram, ProgramVaryings} from "./GLProgram";

export class Compiler {

    private readonly _shaders: { vs?: WebGLShader, fs?: WebGLShader } = {
        vs: undefined,
        fs: undefined
    };

    private _lastCompileResult?: CompilationResult;

    constructor(readonly program: GLProgram) {
    }

    get lastCompileResult(): CompilationResult | undefined {
        return this._lastCompileResult;
    }

    private get gl(): WebGL2RenderingContext {
        return this.program.gl;
    }

    private get glProgram(): WebGLProgram {
        return this.program.glProgram;
    }

    private trimSources(sources: ProgramSources): ProgramSources {
        return {vs: sources.vs.trimStart(), fs: sources.fs.trimStart()};
    }

    deleteShaders(): void {
        if (this._shaders.vs) {
            this.gl.deleteShader(this._shaders.vs);
            this._shaders.vs = undefined;
        }
        if (this._shaders.fs) {
            this.gl.deleteShader(this._shaders.fs);
            this._shaders.fs = undefined;
        }
    }

    compile(sources: ProgramSources, varyings?: ProgramVaryings): CompilationResult {
        sources = this.trimSources(sources);
        if (this.isCompiled(sources, this._lastCompileResult))
            return this._lastCompileResult;

        const start = performance.now();
        this.doCompile(sources, varyings);
        return this.createResult(start, sources, varyings);
    }

    async compileAsync(sources: ProgramSources, varyings?: ProgramVaryings): Promise<CompilationResult> {
        const {gl, glProgram} = this;
        const extension = gl.getExtension("KHR_parallel_shader_compile");
        if (!extension)
            return this.compile(sources, varyings);

        sources = this.trimSources(sources);
        if (this.isCompiled(sources, this._lastCompileResult))
            return Promise.resolve(this._lastCompileResult);

        const start = performance.now();
        this.doCompile(sources, varyings);
        return new Promise((resolve, reject) => {
            const check = () => {
                if (this.program.deleted)
                    reject('Prgram is deleted');
                else if (gl.getProgramParameter(glProgram, extension.COMPLETION_STATUS_KHR) === true)
                    resolve(this.createResult(start, sources, varyings));
                else
                    requestAnimationFrame(check);
            }
            requestAnimationFrame(check);
        });
    }

    private doCompile(sources: ProgramSources, varyings?: ProgramVaryings): void {
        const {gl, glProgram} = this;

        if (!this._shaders.vs) {
            this._shaders.vs = check(gl.createShader(gl.VERTEX_SHADER), "createShader(VERTEX_SHADER)");
            gl.attachShader(glProgram, this._shaders.vs);
        }

        if (!this._shaders.fs) {
            this._shaders.fs = check(gl.createShader(gl.FRAGMENT_SHADER), "createShader(FRAGMENT_SHADER)");
            gl.attachShader(glProgram, this._shaders.fs);
        }

        const {vs, fs} = this._shaders;
        compileShader(gl, sources.vs, vs);
        compileShader(gl, sources.fs, fs);

        if (varyings)
            gl.transformFeedbackVaryings(glProgram, varyings.names, varyings.bufferMode);
        else
            gl.transformFeedbackVaryings(glProgram, [], TransformFeedbackBufferMode.SEPARATE_ATTRIBS);

        gl.linkProgram(glProgram);
    }

    private createResult(start: number, sources: ProgramSources, varyings: ProgramVaryings | undefined): CompilationResult {
        const compileTime = performance.now() - start;
        const {gl, glProgram} = this;
        const {vs, fs} = this._shaders;
        let logs;
        const status = gl.getProgramParameter(glProgram, gl.LINK_STATUS);
        if (!status) {
            logs = {
                vs: vs && this.shaderLog(vs),
                fs: fs && this.shaderLog(fs),
                program: gl.getProgramInfoLog(glProgram)
            };
        }
        this._lastCompileResult = new CompilationResult(this.program, sources, varyings, compileTime, logs);
        return this._lastCompileResult;
    }

    private shaderLog(shader: WebGLShader): string | null | undefined {
        const gl = this.gl;
        return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? undefined : gl.getShaderInfoLog(shader);
    }

    private isCompiled(sources: ProgramSources, lastCompileResult?: CompilationResult): lastCompileResult is CompilationResult {
        const vs = lastCompileResult?.sources.vs;
        const fs = lastCompileResult?.sources.fs;
        return vs === sources.vs && fs === sources.fs;
    }
}

function compileShader(gl: WebGL2RenderingContext, source: string, shader: WebGLShader): WebGLShader {
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}
