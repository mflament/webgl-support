import {
    parameterNameEnum,
    ProgramParameterName,
    ProgramParameterType,
    TransformFeedbackBufferMode
} from "./GLProgramEnums";
import {CompilationResult} from "./CompilationResult";
import {UniformParameterName, uniformParameterNameEnum, UniformParameterType} from "./uniform";
import {compile, compileAsync} from "./GLCompiler";

export type ProgramVaryings = { names: string[], bufferMode: TransformFeedbackBufferMode };

export type ProgramSources = { vs: string, fs: string };

export class GLProgram {
    private readonly _glProgram: WebGLProgram;
    private readonly _sources: ProgramSources = {vs: '', fs: ''};
    private _lastCompileResult?: CompilationResult;

    constructor(readonly gl: WebGL2RenderingContext) {
        const program = gl.createProgram();
        if (!program) throw new Error("Error creating progam");
        this._glProgram = program;
    }

    get glProgram(): WebGLProgram | null {
        return this._glProgram;
    }

    get lastCompileResult(): CompilationResult | undefined {
        return this._lastCompileResult;
    }

    use(): void {
        this.gl.useProgram(this.glProgram);
    }

    unuse(): void {
        this.gl.useProgram(null);
    }

    delete(): void {
        this.gl.deleteProgram(this._glProgram);
    }

    compile(sources: ProgramSources, varyings?: ProgramVaryings): CompilationResult {
        if (!this._lastCompileResult || this.needsCompile(sources)) {
            this._lastCompileResult = compile(this.gl, this._glProgram, sources.vs, sources.fs, varyings) || null;
            Object.assign(this._sources, sources);
        }
        return this._lastCompileResult;
    }

    async compileAsync(sources: ProgramSources, varyings?: ProgramVaryings): Promise<CompilationResult | null> {
        if (!this._lastCompileResult || this.needsCompile(sources)) {
            this._lastCompileResult = await compileAsync(this.gl, this._glProgram, sources.vs, sources.fs, varyings);
            Object.assign(this._sources, sources);
            return this._lastCompileResult;
        }
        return this._lastCompileResult;
    }

    private needsCompile(sources: ProgramSources): boolean {
        return this._sources.vs !== sources.vs || this._sources.fs !== sources.fs;
    }

    getUniformLocation(name: string): WebGLUniformLocation | null {
        return this.glProgram && this.gl.getUniformLocation(this.glProgram, name);
    }

    getAttribLocation(name: string): number {
        return this.glProgram ? this.gl.getAttribLocation(this.glProgram, name) : -1;
    }

    getFragDataLocation(name: string): number {
        return this.glProgram ? this.gl.getFragDataLocation(this.glProgram, name) : -1;
    }

    getBlockIndex(name: string): number | undefined {
        const index = this.glProgram ? this.gl.getUniformBlockIndex(this.glProgram, name) : this.gl.INVALID_INDEX;
        if (index === this.gl.INVALID_INDEX)
            return undefined;
        return index;
    }

    getParameter<P extends ProgramParameterName>(name: P): ProgramParameterType<P> | undefined {
        const {glProgram, gl} = this;
        return glProgram ? gl.getProgramParameter(glProgram, parameterNameEnum(name)) : undefined;
    }

    getUniformParameter<P extends UniformParameterName>(uniformIndex: number, name: P): UniformParameterType<P> {
        return this.getUniformParameters([uniformIndex], name)[0];
    }

    getUniformParameters<P extends UniformParameterName>(uniformIndices: number[], name: P): UniformParameterType<P>[] {
        const {glProgram, gl} = this;
        return glProgram ? gl.getActiveUniforms(glProgram, uniformIndices, uniformParameterNameEnum(name)) : [];
    }

}
