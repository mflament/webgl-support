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
    private _glProgram: WebGLProgram | null;
    private _compiler?: Compiler;

    constructor(readonly gl: WebGL2RenderingContext) {
        this._glProgram = safeCreate(gl, 'createProgram');
        this._compiler = new Compiler(this);
    }

    get glProgram(): WebGLProgram | null {
        return this._glProgram;
    }

    get lastCompileResult(): CompilationResult | undefined {
        return this._compiler?.lastCompileResult;
    }

    use(): void {
        this.gl.useProgram(this.glProgram);
    }

    unuse(): void {
        this.gl.useProgram(null);
    }

    delete(): void {
        if (this._compiler) {
            this._compiler?.deleteShaders();
            this._compiler = undefined;
        }
        if (this._glProgram) {
            this.gl.deleteProgram(this._glProgram);
            this._glProgram = null;
        }
    }

    deleteShaders(): void {
        this._compiler?.deleteShaders();
    }

    compile(sources: ProgramSources, varyings?: ProgramVaryings): CompilationResult | undefined {
        return this._compiler?.compile(sources, varyings);
    }

    async compileAsync(sources: ProgramSources, varyings?: ProgramVaryings): Promise<CompilationResult | undefined> {
        return this._compiler?.compileAsync(sources, varyings);
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
