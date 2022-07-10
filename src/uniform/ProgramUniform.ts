import {mat2, mat3, mat4, vec2, vec3, vec4} from 'gl-matrix';
import {GLContext} from '../GLContext';

export type UniformType =
    | 'int'
    | 'ivec2'
    | 'ivec3'
    | 'ivec4'
    | 'uint'
    | 'uvec2'
    | 'uvec3'
    | 'uvec4'
    | 'float'
    | 'vec2'
    | 'vec3'
    | 'vec4'
    | 'mat2'
    | 'mat3'
    | 'mat4';

export interface UniformJsTypes {
    float: number;
    int: number;
    uint: number;

    vec2: vec2;
    vec3: vec3;
    vec4: vec4;

    ivec2: vec2;
    ivec3: vec3;
    ivec4: vec4;

    uvec2: vec2;
    uvec3: vec3;
    uvec4: vec4;

    mat2: mat2;
    mat3: mat3;
    mat4: mat4;
}

export interface ProgramUniform<T> {
    value: T;
}

export type ProgramUniformsFactory = <T extends UniformType>(
    name: string,
    type: T
) => ProgramUniform<UniformJsTypes[T]>;

export function uniformsFactory(context: GLContext, program: WebGLProgram): ProgramUniformsFactory {
    const {gl, glState} = context;
    return (name, type) => {
        glState.useProgram(program);
        const location = gl.getUniformLocation(program, name);
        return createUniform(context, program, name, location, type);
    };
}

function createUniform<T>(
    context: GLContext,
    program: WebGLProgram,
    name: string,
    location: WebGLUniformLocation | null,
    type: UniformType
): ProgramUniform<T> {
    if (location === null) console.warn('Uniform "' + name + '" not found');
    const create = <V>(v: V, setter: (gl: WebGL2RenderingContext, v: V) => void) =>
        new ProgramUniformImpl<V>(context, program, name, location, v, setter) as any;
    switch (type) {
        case 'int':
            return create(0, (gl, v) => gl.uniform1i(location, v));
        case 'float':
            return create(0, (gl, v) => gl.uniform1f(location, v));
        case 'uint':
            return create(0, (gl, v) => gl.uniform1ui(location, v));
        case 'ivec2':
            return create(vec2.create(), (gl, v) => gl.uniform2i(location, v[0], v[1]));
        case 'uvec2':
            return create(vec2.create(), (gl, v) => gl.uniform2ui(location, v[0], v[1]));
        case 'vec2':
            return create(vec2.create(), (gl, v) => gl.uniform2f(location, v[0], v[1]));
        case 'ivec3':
            return create(vec3.create(), (gl, v) => gl.uniform3i(location, v[0], v[1], v[2]));
        case 'uvec3':
            return create(vec3.create(), (gl, v) => gl.uniform3ui(location, v[0], v[1], v[2]));
        case 'vec3':
            return create(vec3.create(), (gl, v) => gl.uniform3f(location, v[0], v[1], v[2]));
        case 'ivec4':
            return create(vec4.create(), (gl, v) => gl.uniform4i(location, v[0], v[1], v[2], v[3]));
        case 'uvec4':
            return create(vec4.create(), (gl, v) => gl.uniform4ui(location, v[0], v[1], v[2], v[3]));
        case 'vec4':
            return create(vec4.create(), (gl, v) => gl.uniform4f(location, v[0], v[1], v[2], v[3]));
        case 'mat2':
            return create(new Float32Array(2 * 2), (gl, v) => gl.uniformMatrix2fv(location, false, v, 0));
        case 'mat3':
            return create(new Float32Array(3 * 3), (gl, v) => gl.uniformMatrix3fv(location, false, v, 0));
        case 'mat4':
            return create(new Float32Array(4 * 4), (gl, v) => gl.uniformMatrix4fv(location, false, v, 0));
    }
    return create(vec4.create(), (gl, v) => gl.uniform4f(location, v[0], v[1], v[2], v[3]));
}

class ProgramUniformImpl<T> implements ProgramUniform<T> {
    constructor(
        readonly context: GLContext,
        readonly program: WebGLProgram,
        readonly name: string,
        readonly location: WebGLUniformLocation | null,
        private _value: T,
        private readonly setUniform: (gl: WebGL2RenderingContext, value: T) => void
    ) {
    }

    get value(): T {
        return this._value;
    }

    set value(v: T) {
        const {gl, glState} = this.context;
        glState.useProgram(this.program);
        this.setUniform(gl, v);
        this._value = v;
    }
}
