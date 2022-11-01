import {check, safeCreate} from "../utils";
import {VaryingBufferMode} from "../GLEnums";
import {CompilationResult, ProgramLogs, ProgramSources} from "./CompilationResult";

export type ProgramVaryings = { names: string[], bufferMode: VaryingBufferMode };

export class GLProgram {
    private _glProgram?: WebGLProgram;
    private readonly _shaders: { vs?: WebGLShader, fs?: WebGLShader } = {vs: undefined, fs: undefined};
    private _lastCompileResult?: CompilationResult;

    constructor(readonly gl: WebGL2RenderingContext) {
        this._glProgram = safeCreate(gl, 'createProgram');
    }

    get glProgram(): WebGLProgram {
        const glProgram = this._glProgram;
        if (!glProgram) throw new Error("GLProgram is deleted");
        return glProgram;
    }

    get compiled(): boolean {
        return !!this._lastCompileResult?.compiled;
    }

    get sources(): ProgramSources | undefined {
        return this._lastCompileResult?.sources;
    }

    get varyings(): ProgramVaryings | undefined {
        return this._lastCompileResult?.varyings;
    }

    get logs(): ProgramLogs | undefined {
        return this._lastCompileResult?.logs;
    }

    use(): void {
        this.gl.useProgram(this.glProgram);
    }

    unuse(): void {
        this.gl.useProgram(null);
    }

    delete(): void {
        this.deleteShaders();
        if (this._glProgram) {
            this.gl.deleteProgram(this._glProgram);
            this._glProgram = undefined;
        }
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
        const start = performance.now();
        this.doCompile(sources, varyings);
        return this.createResult(start, sources, varyings);
    }

    async compileAsync(sources: ProgramSources, varyings?: ProgramVaryings): Promise<CompilationResult> {
        const gl = this.gl;
        const extension = gl.getExtension("KHR_parallel_shader_compile");
        if (!extension)
            return this.compile(sources, varyings);

        const start = performance.now();
        this.doCompile(sources, varyings);
        return new Promise((resolve, reject) => {
            const check = () => {
                if (!this._glProgram)
                    reject("program is deleted");
                else if (gl.getProgramParameter(this.glProgram, extension.COMPLETION_STATUS_KHR) === true)
                    resolve(this.createResult(start, sources, varyings));
                else
                    requestAnimationFrame(check);
            }
            requestAnimationFrame(check);
        });
    }

    private doCompile(sources: ProgramSources, varyings?: ProgramVaryings): void {
        const {gl, glProgram} = this;
        if (!glProgram)
            throw new Error("program is deleted")

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
        else if (this._lastCompileResult)
            gl.transformFeedbackVaryings(glProgram, [], VaryingBufferMode.SEPARATE_ATTRIBS);

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
        this._lastCompileResult = new CompilationResult(this, sources, varyings, compileTime, logs);
        return this._lastCompileResult;
    }

    private shaderLog(shader: WebGLShader): string | null | undefined {
        const gl = this.gl;
        return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? undefined : gl.getShaderInfoLog(shader);
    }
}

function compileShader(gl: WebGL2RenderingContext, source: string, shader: WebGLShader): WebGLShader {
    source = source.trimStart();
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

