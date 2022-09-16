import {generateStructsClasses, GLContext, QuadRenderer, UniformsIntrospector} from "../src/index";

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

    struct Channel {
        float time;// channel playback time (in seconds)
        vec3 resolution;// channel resolution (in pixels)
    };

    layout(std140) uniform uPipeline {
        vec3      iResolution;// viewport resolution (in pixels)
        float     iTime;// shader playback time (in seconds)
        float     iTimeDelta;// render time (in seconds)
        int       iFrame;// shader playback frame
        vec4      iMouse;// mouse pixel coords. xy: current (if MLB down), zw: click
        vec4      iDate;// (year, month, day, time in seconds)
        float     iSampleRate;// sound sample rate (i.e., 44100)
        Channel   iChannels[4];
    };
    uniform sampler2D iChannel0;// input channel. XX = 2D/Cube
    uniform sampler2D iChannel1;// input channel. XX = 2D/Cube
    uniform sampler2D iChannel3;// input channel. XX = 2D/Cube
    uniform sampler2D iChannel4;// input channel. XX = 2D/Cube

    in vec2 uv;
    out vec4 color;

    void main() {
        color = vec4(1.0);
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

// glState.useProgram(program);
// const definitions = new UniformsIntrospector(gl).introspect(program);
// console.log(definitions.format());
//
// const models = definitions.createModel();
// console.log(models);
//
// // context.renderer = quad;
// // context.toggle();
//
// const pipelineUniformOffsets = {
//     iResolution: -1,
//     iTime: -1,
//     iTimeDelta: -1,
//     iFrame: -1,
//     iMouse: -1,
//     iDate: -1,
//     iSampleRate: -1,
//     iChannels: -1,
// };
//
// const ts = generateStructsClasses(models);
// console.log(ts);
