// language=glsl
export const VS = `
    #version 300 es
    precision highp float;
    in mat4 mat4In;
    in vec2 position;

    out vec2 uv;
    out mat4 testOut;

    void main() {
        gl_Position = vec4(position, 0.0, 1.0) * mat4In;
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

    layout(std140) uniform Pipeline {
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
    in mat4 testOut;

    out vec4 colors[2];

    void main() {
        vec3 v = texture(iChannel0, vec2(0.0)).rgb;
        colors[0] = vec4(v, 1.0);
        colors[1] = vec4(vec3(0.0), 1.0);
    }
`

// language=glsl
export const EFFECT_UNIFORMS = `
    #version 300 es

    precision highp float;
    precision highp sampler2D;
    precision highp sampler3D;
    precision highp samplerCube;

    layout(std140) uniform EffectUniforms {
    // updated once per frame
        vec3  iResolution;
        int   iFrame;
        float iFrameRate;
        float iTime;
        float iTimeDelta;
        vec4  iDate;
        vec4  iMouse;
        float iSampleRate;

    // updated once per pass
        vec3  iPassResolution;
        float iChannelTime[4];
        vec3  iChannelResolution[4];

    // updated by sound pass only
        float iTimeOffset;
        int   iSampleOffset;

    // updated by cubemap pass only
        vec4 unViewport;
        vec3 unCorners[5];
    };


    uniform sampler2D   iChannel0;
    uniform sampler2D   iChannel1;
    uniform sampler3D   iChannel2;
    uniform samplerCube iChannel3;

    out vec4 color;
    void main() {
        color = vec4(vec3(0.0), 1.0);
    }
    
    struct TestStruct {
        int a;
        float b;
    };

    vec2[2] mainImage(out vec4 fragColors[4], in vec2 fragCoord, in TestStruct ts[2])
    {
        vec2[2] res = vec2[](vec2(0.0), vec2(0.0));
        return res;
    }
`
