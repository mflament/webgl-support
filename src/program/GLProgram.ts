import {safeCreate} from "../utils";
import {
    parameterNameEnum,
    ProgramParameterName,
    ProgramParameterType,
    TransformFeedbackBufferMode
} from "./GLProgramEnums";
import {CompilationResult, ProgramSources} from "./CompilationResult";
import {Compiler} from "./Compiler";
import {UniformParameterName, uniformParameterNameEnum, UniformParameterType} from "./uniform";

export type ProgramVaryings = { names: string[], bufferMode: TransformFeedbackBufferMode };

export class GLProgram {
    private _glProgram?: WebGLProgram;
    private readonly _compiler: Compiler;

    constructor(readonly gl: WebGL2RenderingContext) {
        this._glProgram = safeCreate(gl, 'createProgram');
        this._compiler = new Compiler(this);
    }

    get glProgram(): WebGLProgram {
        const glProgram = this._glProgram;
        if (!glProgram) throw new Error("GLProgram is deleted");
        return glProgram;
    }

    get lastCompileResult(): CompilationResult | undefined {
        return this._compiler.lastCompileResult;
    }

    get deleted(): boolean {
        return !this._glProgram;
    }

    use(): void {
        this.gl.useProgram(this.glProgram);
    }

    unuse(): void {
        this.gl.useProgram(null);
    }

    delete(): void {
        this._compiler.deleteShaders();
        if (this._glProgram) {
            this.gl.deleteProgram(this._glProgram);
            this._glProgram = undefined;
        }
    }

    deleteShaders(): void {
        this._compiler.deleteShaders();
    }

    compile(sources: ProgramSources, varyings?: ProgramVaryings): CompilationResult {
        return this._compiler.compile(sources, varyings);
    }

    async compileAsync(sources: ProgramSources, varyings?: ProgramVaryings): Promise<CompilationResult> {
        return this._compiler.compileAsync(sources, varyings);
    }

    getUniformLocation(name: string): WebGLUniformLocation | null {
        return this.gl.getUniformLocation(this.glProgram, name);
    }

    getAttribLocation(name: string): number {
        return this.gl.getAttribLocation(this.glProgram, name);
    }

    getFragDataLocation(name: string): number {
        return this.gl.getFragDataLocation(this.glProgram, name);
    }

    getBlockIndex(name: string): number | undefined {
        const index = this.gl.getUniformBlockIndex(this.glProgram, name);
        if (index === this.gl.INVALID_INDEX)
            return undefined;
        return index;
    }

    getParameter<P extends ProgramParameterName>(name: P): ProgramParameterType<P> {
        const {glProgram, gl} = this;
        return gl.getProgramParameter(glProgram, parameterNameEnum(name));
    }

    getUniformParameter<P extends UniformParameterName>(uniformIndex: number, name: P): UniformParameterType<P> {
        return this.getUniformParameters([uniformIndex], name)[0];
    }

    getUniformParameters<P extends UniformParameterName>(uniformIndices: number[], name: P): UniformParameterType<P>[] {
        const {glProgram, gl} = this;
        return gl.getActiveUniforms(glProgram, uniformIndices, uniformParameterNameEnum(name));
    }

}
