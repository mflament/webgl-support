import {UniformType} from "../../../GLEnums";

export class UniformDefinitions implements Iterable<UniformDefinition> {
    private readonly definitions: UniformDefinition[] = [];

    constructor(readonly blockDefinitions: UniformBlockDefinition[]) {
    }

    get length(): number {
        return this.definitions.length;
    }

    push(d: UniformParams): void {
        const block = d.blockIndex < 0 ? undefined : this.blockDefinitions[d.blockIndex];
        this.definitions.push(new UniformDefinition(d, block));
    }

    [Symbol.iterator](): IterableIterator<UniformDefinition> {
        return this.definitions[Symbol.iterator]();
    }

    format(): string {
        const blocks: string[] = [];
        this.definitions.map(ui => ui.format()).forEach(s => blocks.push(s));
        return blocks.join("\n");
    }

}

export class UniformsIntrospector {
    constructor(readonly gl: WebGL2RenderingContext) {
    }

    introspect(program: WebGLProgram): UniformDefinitions {
        const gl = this.gl;
        const blocksCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORM_BLOCKS);
        const blockDefinitions: UniformBlockDefinition[] = [];
        for (let i = 0; i < blocksCount; i++) {
            const blockName = gl.getActiveUniformBlockName(program, i);
            if (blockName) {
                const blockSize = gl.getActiveUniformBlockParameter(program, i, gl.UNIFORM_BLOCK_DATA_SIZE);
                const blockBinding = gl.getActiveUniformBlockParameter(program, i, gl.UNIFORM_BLOCK_BINDING);
                blockDefinitions.push(new UniformBlockDefinition(blockName, blockSize, blockBinding));
            }
        }
        const definitions = new UniformDefinitions(blockDefinitions);
        const activeUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        if (activeUniforms == 0)
            return definitions;

        const uniformIndices: number[] = [];
        for (let i = 0; i < activeUniforms; i++) uniformIndices.push(i);
        const blockIndices = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_BLOCK_INDEX);
        const offsets = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_OFFSET);
        const arrayStrides = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_ARRAY_STRIDE);
        const matrixStrides = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_MATRIX_STRIDE);
        const rowMajors = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_IS_ROW_MAJOR);

        for (let i = 0; i < activeUniforms; i++) {
            const au = gl.getActiveUniform(program, i);
            if (au) {
                definitions.push({
                    location: blockIndices[i] < 0 ? gl.getUniformLocation(program, au.name)! : undefined,
                    name: au.name,
                    type: au.type,
                    size: au.size,
                    blockIndex: blockIndices[i],
                    offset: offsets[i],
                    arrayStride: arrayStrides[i],
                    matrixStride: matrixStrides[i],
                    isRowMajor: rowMajors[i]
                });
            }
        }

        return definitions;
    }
}

interface UniformParams {
    location?: WebGLUniformLocation;
    name: string;
    type: UniformType;

    size: number;
    arrayStride: number;

    matrixStride: number;
    isRowMajor: boolean;

    blockIndex: number;
    offset: number;
}

export class UniformDefinition {
    readonly location?: WebGLUniformLocation;
    readonly name: string;
    readonly type: UniformType;
    readonly size: number;
    readonly offset: number;
    readonly arrayStride: number;
    readonly matrixStride: number;
    readonly isRowMajor: boolean;
    readonly blockIndex: number;

    constructor(definition: UniformParams, readonly blockDefinition?: UniformBlockDefinition) {
        this.location = definition.location;
        this.name = blockDefinition ? blockDefinition.name + '.' + definition.name : definition.name;
        this.type = definition.type;
        this.size = definition.size;
        this.offset = definition.offset;
        this.arrayStride = definition.arrayStride;
        this.matrixStride = definition.matrixStride;
        this.isRowMajor = definition.isRowMajor;
        this.blockIndex = definition.blockIndex;
    }

    isArray(): boolean {
        return this.size > 1;
    }

    isVector(): boolean {
        return isVector(this.type);
    }

    isMatrix(): boolean {
        return isMatrix(this.type);
    }

    isBlockUniform(): this is BlockUniformDefinition {
        return !!this.blockDefinition;
    }

    isProgramUniformDefinition(): this is ProgramUniformDefinition {
        return this.location !== undefined;
    }

    format(): string {
        let s = `${this.name} : ${UniformType[this.type]}`;
        if (this.isArray()) s += `[${this.size}]`;
        if (this.isMatrix()) s += ` isRowMajor: ${this.isRowMajor}`
        if (this.isBlockUniform()) s += ` blockName: '${this.blockDefinition.name}' offset: ${this.offset} arrayStride: ${this.arrayStride} matrixStride: ${this.matrixStride}`;
        return s;
    }
}

export interface ProgramUniformDefinition extends UniformDefinition {
    readonly location: WebGLUniformLocation;
}

export interface BlockUniformDefinition extends UniformDefinition {
    readonly blockDefinition: UniformBlockDefinition;
}

export class UniformBlockDefinition {
    constructor(readonly name: string, readonly size: number, readonly binding: number) {
    }
}

function isVector(type: UniformType): boolean {
    switch (type) {
        case UniformType.FLOAT_VEC2:
        case UniformType.FLOAT_VEC3:
        case UniformType.FLOAT_VEC4:
        case UniformType.INT_VEC2:
        case UniformType.INT_VEC3:
        case UniformType.INT_VEC4:
        case UniformType.BOOL_VEC2:
        case UniformType.BOOL_VEC3:
        case UniformType.BOOL_VEC4:
        case UniformType.UNSIGNED_INT_VEC2:
        case UniformType.UNSIGNED_INT_VEC3:
        case UniformType.UNSIGNED_INT_VEC4:
            return true;
        default:
            return false;
    }
}

function isMatrix(type: UniformType): boolean {
    switch (type) {
        case UniformType.FLOAT_MAT2:
        case UniformType.FLOAT_MAT2x3:
        case UniformType.FLOAT_MAT2x4:
        case UniformType.FLOAT_MAT3:
        case UniformType.FLOAT_MAT3x2:
        case UniformType.FLOAT_MAT3x4:
        case UniformType.FLOAT_MAT4:
        case UniformType.FLOAT_MAT4x2:
        case UniformType.FLOAT_MAT4x3:
            return true;
        default:
            return false;
    }
}
