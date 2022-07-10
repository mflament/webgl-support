import {GLContext, ProgramUniforms, QuadRenderer, UniformsIntrospector} from "../src";

// language=glsl
const VS = `
    #version 300 es
    precision highp float;
    layout(location=0) in vec2 position;
    out vec2 uv;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
        uv = position;
    }
`;

// language=glsl
const FS = `
    #version 300 es

    precision highp float;
    precision highp sampler2D;

    uniform vec3 uColor;

    struct Shape {
        vec3 positon;
        vec4 rotation;
        vec4 color;
    };

    struct OtherStruct {
        mat4 world;
        mat4 invWorld;
        mat4 matrices[2];
        Shape shape;
    };

    layout(std140) uniform uBlock {
        uvec2 uv2;
        vec3 v3;
        ivec4 iv4;
        Shape shapes[5];
        Shape nextShapes[3];
        ivec2 shapesCount;
        OtherStruct otherStructs[2];
    };

    layout(std140) uniform uBlock2{
        OtherStruct otherOtherStructs[2];
    };
    
    in vec2 uv;
    out vec4 color;
    
    void main() {
        color = vec4(v3, 1.0);
    }
`

export interface TestUniforms {
    uColor: Float32Array | [number, number, number]
    uFloat: number
}

const context = new GLContext();
const gl = context.gl;
const glState = context.glState;

const quad = new QuadRenderer(context, FS, VS);
const program = quad.program;

glState.useProgram(program);
const definitions = new UniformsIntrospector(gl).introspect(program);
console.log(definitions.format());

const models = ProgramUniforms.create(definitions);
console.log(models);

// context.renderer = quad;
// context.toggle();