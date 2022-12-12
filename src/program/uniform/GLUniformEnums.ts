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
