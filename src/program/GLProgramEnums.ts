export enum TransformFeedbackBufferMode {
    INTERLEAVED_ATTRIBS = WebGL2RenderingContext.INTERLEAVED_ATTRIBS,
    SEPARATE_ATTRIBS = WebGL2RenderingContext.SEPARATE_ATTRIBS
}

export type ProgramParameterName =
    'DELETE_STATUS'
    | 'LINK_STATUS'
    | 'VALIDATE_STATUS'
    | 'ATTACHED_SHADERS'
    | 'ACTIVE_ATTRIBUTES'
    | 'ACTIVE_UNIFORMS'
    | 'TRANSFORM_FEEDBACK_BUFFER_MODE'
    | 'TRANSFORM_FEEDBACK_VARYINGS'
    | 'ACTIVE_UNIFORM_BLOCKS';

export enum ShaderType {
    VERTEX_SHADER = WebGL2RenderingContext.VERTEX_SHADER,
    FRAGMENT_SHADER = WebGL2RenderingContext.FRAGMENT_SHADER
}

export function parameterNameEnum(name: ProgramParameterName) {
    switch (name) {
        case 'DELETE_STATUS':
            return WebGL2RenderingContext.DELETE_STATUS;
        case 'LINK_STATUS':
            return WebGL2RenderingContext.LINK_STATUS;
        case 'VALIDATE_STATUS':
            return WebGL2RenderingContext.VALIDATE_STATUS;
        case 'ATTACHED_SHADERS':
            return WebGL2RenderingContext.ATTACHED_SHADERS;
        case 'ACTIVE_ATTRIBUTES':
            return WebGL2RenderingContext.ACTIVE_ATTRIBUTES;
        case 'ACTIVE_UNIFORMS':
            return WebGL2RenderingContext.ACTIVE_UNIFORMS;
        case 'TRANSFORM_FEEDBACK_BUFFER_MODE':
            return WebGL2RenderingContext.TRANSFORM_FEEDBACK_BUFFER_MODE;
        case 'TRANSFORM_FEEDBACK_VARYINGS':
            return WebGL2RenderingContext.TRANSFORM_FEEDBACK_VARYINGS;
        case 'ACTIVE_UNIFORM_BLOCKS':
            return WebGL2RenderingContext.ACTIVE_UNIFORM_BLOCKS;
        default:
            throw new Error("Unknown program parameter " + name);
    }
}

export type ProgramParameterType<T extends ProgramParameterName> = ProgramParameters[T];

interface ProgramParameters extends Record<ProgramParameterName, GLenum | GLint | GLboolean> {
    DELETE_STATUS: GLboolean;
    LINK_STATUS: GLboolean;
    VALIDATE_STATUS: GLboolean;
    ATTACHED_SHADERS: GLint;
    ACTIVE_ATTRIBUTES: GLint;
    ACTIVE_UNIFORMS: GLint;
    TRANSFORM_FEEDBACK_BUFFER_MODE: TransformFeedbackBufferMode;
    TRANSFORM_FEEDBACK_VARYINGS: GLint;
    ACTIVE_UNIFORM_BLOCKS: GLint;
}
