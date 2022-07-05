import {
    GLContext,
    QuadRenderer,
    UniformBinder,
    UniformInterfaceGenerator,
    ProgramUniforms,
    UniformsIntrospector
} from "../src";

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

    uniform vec3 uColor;

    layout(std140) uniform uBlock {
        uvec2 uv2;
        vec3 v3;
        ivec4 iv4;
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
const uniforms = new UniformBinder(gl).bind<TestUniforms>(models);
uniforms.uColor = [1, 0, 1];
uniforms.uFloat = .5;
const ts = new UniformInterfaceGenerator().generate("TestUniforms", models);
console.log(ts);


context.renderer = quad;
context.running = true;