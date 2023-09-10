import {GLType} from "../GLType";

export type UniformParameterName =
    'UNIFORM_TYPE'
    | 'UNIFORM_SIZE'
    | 'UNIFORM_BLOCK_INDEX'
    | 'UNIFORM_OFFSET'
    | 'UNIFORM_ARRAY_STRIDE'
    | 'UNIFORM_MATRIX_STRIDE'
    | 'UNIFORM_IS_ROW_MAJOR';

export type UniformParameterType<T extends UniformParameterName> = UniformParameters[T];

export function uniformParameterNameEnum(name: UniformParameterName) {
    switch (name) {
        case 'UNIFORM_TYPE':
            return WebGL2RenderingContext.UNIFORM_TYPE;
        case 'UNIFORM_SIZE':
            return WebGL2RenderingContext.UNIFORM_SIZE;
        case 'UNIFORM_BLOCK_INDEX':
            return WebGL2RenderingContext.UNIFORM_BLOCK_INDEX;
        case 'UNIFORM_OFFSET':
            return WebGL2RenderingContext.UNIFORM_OFFSET;
        case 'UNIFORM_ARRAY_STRIDE':
            return WebGL2RenderingContext.UNIFORM_ARRAY_STRIDE;
        case 'UNIFORM_MATRIX_STRIDE':
            return WebGL2RenderingContext.UNIFORM_MATRIX_STRIDE;
        case 'UNIFORM_IS_ROW_MAJOR':
            return WebGL2RenderingContext.UNIFORM_IS_ROW_MAJOR;
        default:
            throw new Error("Unknown program parameter " + name);
    }
}

interface UniformParameters extends Record<UniformParameterName, GLenum | GLint | GLboolean> {
    UNIFORM_TYPE: GLType;
    UNIFORM_SIZE: GLuint;
    UNIFORM_BLOCK_INDEX: GLint;
    UNIFORM_OFFSET: GLint;
    UNIFORM_ARRAY_STRIDE: GLint;
    UNIFORM_MATRIX_STRIDE: GLint;
    UNIFORM_IS_ROW_MAJOR: GLboolean;
}

export interface BaseUniformDefinition {
    name: string;
    type: GLenum;
    size: number;
    arraySize?: number;
    arrayStride: number;
    matrixStride: number;
    rowMajors?: boolean;
}

export interface VariableDefinition extends BaseUniformDefinition {
    definitionType: 'VariableDefinition';
    location: number;
}

export interface BlockDefinition {
    definitionType: 'BlockDefinition';
    name: string;
    index: number;
    binding: number;
    size: number;
    members: Members;
    referencedByVS: boolean;
    referencedByFS: boolean;
}

export type Members = (BlockVariableDefinition | StructDefinition)[];

export interface BlockVariableDefinition extends BaseUniformDefinition {
    definitionType: 'BlockVariableDefinition';
    offset: number;
}

export interface StructDefinition {
    name: string;
    arraySize?: number;
    members: Members;
}

export function collectUniforms(gl: WebGL2RenderingContext, program: WebGLProgram): (VariableDefinition | BlockDefinition)[] {
    const activeUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    const uniformIndices = new Array(activeUniforms);
    for (let i = 0; i < activeUniforms; i++) uniformIndices[i] = i;

    const types = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_TYPE);
    const sizes = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_SIZE);
    const blockIndices = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_BLOCK_INDEX);
    const offsets = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_OFFSET);
    const arrayStrides = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_ARRAY_STRIDE);
    const matrixStrides = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_MATRIX_STRIDE);
    const rowMajors = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_IS_ROW_MAJOR);

    const uniforms: (VariableDefinition | BlockDefinition)[] = [];
    const activeUniformBlocks = gl.getProgramParameter(program, gl.ACTIVE_UNIFORM_BLOCKS);
    const blocks: BlockDefinition[] = new Array(activeUniformBlocks);
    for (let index = 0; index < activeUniformBlocks; index++) {
        const name = gl.getActiveUniformBlockName(program, index);
        if (!name)
            continue;

        const binding = gl.getActiveUniformBlockParameter(program, index, gl.UNIFORM_BLOCK_BINDING);
        const size = gl.getActiveUniformBlockParameter(program, index, gl.UNIFORM_BLOCK_DATA_SIZE);
        const referencedByVS = gl.getActiveUniformBlockParameter(program, index, gl.UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER);
        const referencedByFS = gl.getActiveUniformBlockParameter(program, index, gl.UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER);
        const block: BlockDefinition = {
            definitionType: 'BlockDefinition',
            index,
            name,
            binding,
            size,
            referencedByVS,
            referencedByFS,
            members: []
        }
        uniforms.push(block);
        blocks[index] = block;
    }

    for (let i = 0; i < activeUniforms; i++) {
        const uniformName = gl.getActiveUniform(program, i)?.name;
        if (!uniformName)
            continue;
        const blockIndex = blockIndices[i];
        if (blockIndex >= 0) {
            const block = blocks[blockIndex];
            const path = uniformName.split('.');
            let container: Members = block.members;
            for (let j = 1; j < path.length - 1; j++) {
                const part = path[j];
                const arrayInfo = parseArrayIndex(part);
                const name = arrayInfo ? arrayInfo.name : part;
                let child = container.find((s): s is StructDefinition => s.name === name);
                if (!child) {
                    child = {name, arraySize: arrayInfo ? 1 : undefined, members: []};
                    container.push(child);
                } else if (arrayInfo) {
                    child.arraySize = arrayInfo.index + 1;
                }
                container = child.members;
            }

            const part = path[path.length - 1];
            const arrayInfo = parseArrayIndex(part);
            const name = arrayInfo ? arrayInfo.name : part;
            let member = container.find((m): m is BlockVariableDefinition => m.name === name);
            if (!member) {
                member = {
                    definitionType: 'BlockVariableDefinition',
                    name,
                    type: types[i],
                    size: sizes[i],
                    offset: offsets[i],
                    arraySize: arrayInfo ? 1 : undefined,
                    arrayStride: arrayStrides[i],
                    matrixStride: matrixStrides[i],
                    rowMajors: rowMajors[i]
                };
                container.push(member);
            } else if (arrayInfo) {
                member.arraySize = arrayInfo.index + 1;
            }
        } else {
            const arrayInfo = parseArrayIndex(uniformName);
            const name = arrayInfo ? arrayInfo.name : uniformName;
            let variable = uniforms.find((b): b is VariableDefinition => b.name === name);
            if (!variable) {
                variable = {
                    definitionType: "VariableDefinition",
                    location: i,
                    name,
                    size: sizes[i],
                    type: types[i],
                    arraySize: arrayInfo ? 1 : undefined,
                    arrayStride: arrayStrides[i],
                    matrixStride: matrixStrides[i],
                    rowMajors: rowMajors[i]
                };
                uniforms.push(variable);
            } else if (arrayInfo) {
                variable.arraySize = arrayInfo.index + 1;
            }
        }
    }
    return uniforms;
}

function parseArrayIndex(s: string): { name: string, index: number } | undefined {
    const match = s.match(/(\w+)\[(\d+)]/);
    if (match) {
        return {
            name: match[1],
            index: parseInt(match[2])
        };
    }
    return undefined;
}