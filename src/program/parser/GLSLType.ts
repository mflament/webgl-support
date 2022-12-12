import {GLType} from "../GLType"
import {BufferAttributeSize, FloatAttributeType, IntAttributeType, PartialBufferAttribute} from "../../render";

// https://www.khronos.org/opengl/wiki/Data_Type_(GLSL)

const glslScalars = {
    // scalar
    bool: WebGL2RenderingContext.BOOL,
    int: WebGL2RenderingContext.INT,
    uint: WebGL2RenderingContext.UNSIGNED_INT,
    float: WebGL2RenderingContext.FLOAT,
}

const glslVectors = {
    bvec2: WebGL2RenderingContext.BOOL_VEC2,
    bvec3: WebGL2RenderingContext.BOOL_VEC3,
    bvec4: WebGL2RenderingContext.BOOL_VEC4,

    ivec2: WebGL2RenderingContext.INT_VEC2,
    ivec3: WebGL2RenderingContext.INT_VEC3,
    ivec4: WebGL2RenderingContext.INT_VEC4,

    uvec2: WebGL2RenderingContext.UNSIGNED_INT_VEC2,
    uvec3: WebGL2RenderingContext.UNSIGNED_INT_VEC3,
    uvec4: WebGL2RenderingContext.UNSIGNED_INT_VEC4,

    vec2: WebGL2RenderingContext.FLOAT_VEC2,
    vec3: WebGL2RenderingContext.FLOAT_VEC3,
    vec4: WebGL2RenderingContext.FLOAT_VEC4,
}

const glslMatrices = {
    mat2: WebGL2RenderingContext.FLOAT_MAT2,
    mat3: WebGL2RenderingContext.FLOAT_MAT3,
    mat4: WebGL2RenderingContext.FLOAT_MAT4,
    mat2x3: WebGL2RenderingContext.FLOAT_MAT2x3,
    mat2x4: WebGL2RenderingContext.FLOAT_MAT2x4,
    mat3x2: WebGL2RenderingContext.FLOAT_MAT3x2,
    mat3x4: WebGL2RenderingContext.FLOAT_MAT3x4,
    mat4x2: WebGL2RenderingContext.FLOAT_MAT4x2,
    mat4x3: WebGL2RenderingContext.FLOAT_MAT4x3,
}

const glslSamplers = {
    sampler2D: WebGL2RenderingContext.SAMPLER_2D,
    sampler3D: WebGL2RenderingContext.SAMPLER_3D,
    samplerCube: WebGL2RenderingContext.SAMPLER_CUBE,
    sampler2DArray: WebGL2RenderingContext.SAMPLER_2D_ARRAY,

    isampler2D: WebGL2RenderingContext.INT_SAMPLER_2D,
    isampler3D: WebGL2RenderingContext.INT_SAMPLER_3D,
    isamplerCube: WebGL2RenderingContext.INT_SAMPLER_CUBE,
    isampler2DArray: WebGL2RenderingContext.INT_SAMPLER_2D_ARRAY,

    usampler2D: WebGL2RenderingContext.UNSIGNED_INT_SAMPLER_2D,
    usampler3D: WebGL2RenderingContext.UNSIGNED_INT_SAMPLER_3D,
    usamplerCube: WebGL2RenderingContext.UNSIGNED_INT_SAMPLER_CUBE,
    usampler2DArray: WebGL2RenderingContext.UNSIGNED_INT_SAMPLER_2D_ARRAY,
}

const glslTypes = {...glslScalars, ...glslVectors, ...glslMatrices, ...glslSamplers};

export type GLSLScalarType = keyof typeof glslScalars;
export type GLSLVectorType = keyof typeof glslVectors;
export type GLSLMatrixType = keyof typeof glslMatrices;
export type GLSLSamplerType = keyof typeof glslSamplers;
export type GLSLType = GLSLScalarType | GLSLVectorType | GLSLMatrixType | GLSLSamplerType;

export function isGLSLType(name: string): name is GLSLType {
    return (glslTypes as any)[name] !== undefined;
}

export function isGLSLScalarType(name: string): name is GLSLScalarType {
    return (glslScalars as any)[name] !== undefined;
}

export function isGLSLVectorType(name: string): name is GLSLVectorType {
    return (glslVectors as any)[name] !== undefined;
}

export function isGLSLMatrixType(name: string): name is GLSLMatrixType {
    return (glslMatrices as any)[name] !== undefined;
}

export function isGLSLSamplerType(name: string): name is GLSLSamplerType {
    return (glslSamplers as any)[name] !== undefined;
}

export function getGLType(glslType: GLSLType): GLType {
    return glslTypes[glslType];
}

export function getGLSLType(param: GLType | PartialBufferAttribute): GLSLType | undefined {
    if (typeof param === "number") {
        const glType = param;
        const entry = Object.entries(glslTypes).find(e => e[1] === glType);
        return entry ? entry[0] as GLSLType : undefined
    } else {
        const attribute = param;
        if (attribute.attributeType === "int") {
            if (attribute.type === IntAttributeType.UNSIGNED_BYTE ||
                attribute.type === IntAttributeType.UNSIGNED_SHORT ||
                attribute.type === IntAttributeType.UNSIGNED_INT) {
                return glslUints[attribute.size];
            }
            return glslInts[attribute.size];
        }
        return glslFloats[attribute.size];
    }
}

export function createBufferAttribute(glslType: GLSLScalarType | GLSLVectorType): PartialBufferAttribute {
    const type = getAttributeType(glslType);
    const size = getAttributeSize(glslType);
    return type === FloatAttributeType.FLOAT
        ? {type, size}
        : {attributeType: "int", type: type as IntAttributeType, size};
}

export function createBufferAttributes(glslType: GLSLScalarType | GLSLVectorType | GLSLMatrixType): PartialBufferAttribute[] {
    const count = getAttributesCount(glslType);
    const res: PartialBufferAttribute[] = [];
    const attr = createBufferAttribute(glslType as any);
    for (let i = 0; i < count; i++)
        res.push({...attr});
    return res;
}

export function getAttributeType(glslType: GLSLType) {
    switch (glslType) {
        case 'int':
        case 'ivec2':
        case 'ivec3':
        case 'ivec4':
            return IntAttributeType.INT;
        case 'uint':
        case 'uvec2':
        case 'uvec3':
        case 'uvec4':
            return IntAttributeType.UNSIGNED_INT;
        default:
            return FloatAttributeType.FLOAT;
    }
}

export function getAttributeSize(glslType: GLSLType): BufferAttributeSize {
    switch (glslType) {
        case 'ivec2':
        case 'uvec2':
        case 'vec2':
        case 'mat2':
        case 'mat3x2':
        case 'mat4x2':
            return 2;
        case 'mat3':
        case 'mat2x3':
        case 'mat4x3':
        case 'ivec3':
        case 'uvec3':
        case 'vec3':
            return 3;
        case 'ivec4':
        case 'uvec4':
        case 'vec4':
        case 'mat4':
        case 'mat2x4':
        case 'mat3x4':
            return 4;
        default:
            return 1;
    }
}

export function getAttributesCount(glslType: GLSLType): number {
    switch (glslType) {
        case 'mat2':
        case 'mat2x3':
        case 'mat2x4':
            return 2;
        case 'mat3':
        case 'mat3x2':
        case 'mat3x4':
            return 3;
        case 'mat4':
        case 'mat4x2':
        case 'mat4x3':
            return 4;
        default :
            return 1;
    }
}

const glslUints: GLSLType[] = ['uint', 'uvec2', 'uvec3', 'uvec4'];
const glslInts: GLSLType[] = ['int', 'ivec2', 'ivec3', 'ivec4'];
const glslFloats: GLSLType[] = ['float', 'vec2', 'vec3', 'vec4'];
