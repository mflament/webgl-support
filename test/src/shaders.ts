
// language=glsl
export const VS = `
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
export const FS = `
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
