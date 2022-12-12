export enum GLScalarType {
    BOOL = WebGL2RenderingContext.BOOL,
    INT = WebGL2RenderingContext.INT,
    UNSIGNED_INT = WebGL2RenderingContext.UNSIGNED_INT,
    FLOAT = WebGL2RenderingContext.FLOAT,
}

export enum GLVectorType {
    BOOL_VEC2 = WebGL2RenderingContext.BOOL_VEC2,
    BOOL_VEC3 = WebGL2RenderingContext.BOOL_VEC3,
    BOOL_VEC4 = WebGL2RenderingContext.BOOL_VEC4,

    INT_VEC2 = WebGL2RenderingContext.INT_VEC2,
    INT_VEC3 = WebGL2RenderingContext.INT_VEC3,
    INT_VEC4 = WebGL2RenderingContext.INT_VEC4,

    UNSIGNED_INT_VEC2 = WebGL2RenderingContext.UNSIGNED_INT_VEC2,
    UNSIGNED_INT_VEC3 = WebGL2RenderingContext.UNSIGNED_INT_VEC3,
    UNSIGNED_INT_VEC4 = WebGL2RenderingContext.UNSIGNED_INT_VEC4,

    FLOAT_VEC2 = WebGL2RenderingContext.FLOAT_VEC2,
    FLOAT_VEC3 = WebGL2RenderingContext.FLOAT_VEC3,
    FLOAT_VEC4 = WebGL2RenderingContext.FLOAT_VEC4,
}

export enum GLMatrixType {
    FLOAT_MAT2 = WebGL2RenderingContext.FLOAT_MAT2,
    FLOAT_MAT3 = WebGL2RenderingContext.FLOAT_MAT3,
    FLOAT_MAT4 = WebGL2RenderingContext.FLOAT_MAT4,

    FLOAT_MAT2x3 = WebGL2RenderingContext.FLOAT_MAT2x3,
    FLOAT_MAT2x4 = WebGL2RenderingContext.FLOAT_MAT2x4,
    FLOAT_MAT3x2 = WebGL2RenderingContext.FLOAT_MAT3x2,
    FLOAT_MAT3x4 = WebGL2RenderingContext.FLOAT_MAT3x4,
    FLOAT_MAT4x2 = WebGL2RenderingContext.FLOAT_MAT4x2,
    FLOAT_MAT4x3 = WebGL2RenderingContext.FLOAT_MAT4x3,

}

export enum GLSamplerType {
    SAMPLER2D = WebGL2RenderingContext.SAMPLER_2D,
    SAMPLER_CUBE = WebGL2RenderingContext.SAMPLER_CUBE,

    SAMPLER_3D = WebGL2RenderingContext.SAMPLER_3D,
    SAMPLER_2D_SHADOW = WebGL2RenderingContext.SAMPLER_2D_SHADOW,
    SAMPLER_2D_ARRAY = WebGL2RenderingContext.SAMPLER_2D_ARRAY,
    SAMPLER_2D_ARRAY_SHADOW = WebGL2RenderingContext.SAMPLER_2D_ARRAY_SHADOW,
    SAMPLER_CUBE_SHADOW = WebGL2RenderingContext.SAMPLER_CUBE_SHADOW,

    INT_SAMPLER_2D = WebGL2RenderingContext.INT_SAMPLER_2D,
    INT_SAMPLER_3D = WebGL2RenderingContext.INT_SAMPLER_3D,
    INT_SAMPLER_CUBE = WebGL2RenderingContext.INT_SAMPLER_CUBE,
    INT_SAMPLER_2D_ARRAY = WebGL2RenderingContext.INT_SAMPLER_2D_ARRAY,

    UNSIGNED_INT_SAMPLER_2D = WebGL2RenderingContext.UNSIGNED_INT_SAMPLER_2D,
    UNSIGNED_INT_SAMPLER_3D = WebGL2RenderingContext.UNSIGNED_INT_SAMPLER_3D,
    UNSIGNED_INT_SAMPLER_CUBE = WebGL2RenderingContext.UNSIGNED_INT_SAMPLER_CUBE,
    UNSIGNED_INT_SAMPLER_2D_ARRAY = WebGL2RenderingContext.UNSIGNED_INT_SAMPLER_2D_ARRAY
}

export type GLType = GLScalarType | GLVectorType | GLMatrixType | GLSamplerType;

export function isGLType(value: number): value is GLType {
    return isGLScalarType(value) || isGLVectorType(value) || isGLMatrixType(value) || isGLSamplerType(value);
}

export function isGLScalarType(value: number): value is GLScalarType {
    return GLScalarType[value] !== undefined;
}

export function isGLVectorType(value: number): value is GLVectorType {
    return GLVectorType[value] !== undefined;
}

export function isGLMatrixType(value: number): value is GLMatrixType {
    return GLMatrixType[value] !== undefined;
}

export function isGLSamplerType(value: number): value is GLSamplerType {
    return GLSamplerType[value] !== undefined;
}


export function getTypeComponents(type: GLScalarType | GLVectorType | GLMatrixType): number {
    const components = glTypeData[type];
    if (components === undefined)
        throw new Error("Unknown type " + type + " " + components);
    return components;
}

const glTypeData = [
    [WebGL2RenderingContext.BOOL, 1],
    [WebGL2RenderingContext.INT, 1],
    [WebGL2RenderingContext.UNSIGNED_INT, 1],
    [WebGL2RenderingContext.FLOAT, 1],
    [WebGL2RenderingContext.BOOL_VEC2, 2],
    [WebGL2RenderingContext.BOOL_VEC3, 3],
    [WebGL2RenderingContext.BOOL_VEC4, 4],
    [WebGL2RenderingContext.INT_VEC2, 2],
    [WebGL2RenderingContext.INT_VEC3, 3],
    [WebGL2RenderingContext.INT_VEC4, 4],
    [WebGL2RenderingContext.UNSIGNED_INT_VEC2, 2],
    [WebGL2RenderingContext.UNSIGNED_INT_VEC3, 3],
    [WebGL2RenderingContext.UNSIGNED_INT_VEC4, 4],
    [WebGL2RenderingContext.FLOAT_VEC2, 2],
    [WebGL2RenderingContext.FLOAT_VEC3, 3],
    [WebGL2RenderingContext.FLOAT_VEC4, 4],
    [WebGL2RenderingContext.FLOAT_MAT2, 2 * 2],
    [WebGL2RenderingContext.FLOAT_MAT3, 3 * 3],
    [WebGL2RenderingContext.FLOAT_MAT4, 4 * 4],
    [WebGL2RenderingContext.FLOAT_MAT2x3, 2 * 3],
    [WebGL2RenderingContext.FLOAT_MAT2x4, 2 * 4],
    [WebGL2RenderingContext.FLOAT_MAT3x2, 3 * 2],
    [WebGL2RenderingContext.FLOAT_MAT3x4, 3 * 4],
    [WebGL2RenderingContext.FLOAT_MAT4x2, 4 * 2],
    [WebGL2RenderingContext.FLOAT_MAT4x3, 4 * 3]
].reduce((data, entry) => {
    data[entry[0]] = entry[1];
    return data;
}, [] as number[]);
