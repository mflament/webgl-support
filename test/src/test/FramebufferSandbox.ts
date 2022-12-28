import {
    analyzeUniformBlocks,
    createQuadProgram, flattenUniforms,
    GLContext,
    GLProgram,
    isArraySpan,
    parseShader,
    QuadBuffer
} from "../../../src";

// language=glsl
const VS = `
    #version 300 es
    precision highp float;

    void vertex(in int vertexId, out vec3 vPosition);

    in vec2 position;
    
    out vec3 vPosition;
    
    void main(void)
    {
        vertex(gl_VertexID, vPosition);
        gl_Position = vec4(vPosition, 1.0);
    }

    out vec2 uv;

    void vertex(in int vertexId, out vec3 vPosition) {
        uv = vec2((position + 1.0) * 0.5);
        vPosition = vec3(position, 0.0);
    }
    
    void test(in vec2 vIn) {
        
    }
`

// language=glsl
const RENDER_FS = `
    #version 300 es
    precision highp float;

    in vec2 uv;

    out vec4 color;

    void main() {
        vec3 c = vec3(uv, 0.0);
        color = vec4(c, 1.0);
    }
`

//language=glsl
const ST_UNIFORMS = `#version 300 es
precision highp float;

struct TestStruct {
    int   iSampleOffset;
    float iTimeOffset;
    vec4[4]  colors;
};

uniform TestStruct[5] uts0;
uniform vec2 uTest[10];

in vec2 uv;

out vec4 color;

const float[1] map = float[1] (0.0);
void test() {
    for (int i = 0; i < map.length(); i++) {
    }
}
void main() {
    vec3 c = vec3(uv, 0.0);
    color = vec4(c, 1.0);
    test();
}
`

function testParser(gl: WebGL2RenderingContext) {
    const program = new GLProgram(gl);
    const cr = program.compile({vs: VS, fs: ST_UNIFORMS});
    if (cr.hasError()) throw cr.formatLogs();
    const blocks = analyzeUniformBlocks(program);
    const lines = Object.entries(blocks).flatMap(([name, block]) => {
        const lines = [`export interface ${name}Offsets {`];
        Object.entries(block.members).sort(e => e[1].offset)
            .map(([name, span]) => {
                let arraySize, arrayStride;
                if (isArraySpan(span)) {
                    arraySize = span.arraySize;
                    arrayStride = span.arrayStride;
                    return `    ${name}: [${span.offset}, ${arraySize}, ${arrayStride}],`
                } else {
                    return `    ${name}: ${span.offset},`
                }
            })
            .forEach(l => lines.push(l));
        lines.push('}');
        lines.push(`const ${name}Size = ${block.blockSize}`, '');
        return lines;
    }).join("\n");
    console.log(lines);

    // const parsedShader = parseShader(EFFECT_UNIFORMS);
    // console.log(parsedShader);
}

export async function createFramebufferSandbox(glc: GLContext) {
    const {gl} = glc;

    const ps = parseShader(TEST_SHADER);
    console.log(ps);
    console.log(flattenUniforms(ps));

    testParser(gl);

    // const parsedShader = parseShader(VS);
    // console.log(parsedShader)

    const quadBuffer = new QuadBuffer(gl);

    const renderProgram = await createQuadProgram(gl, {vs: VS, fs: RENDER_FS});

    renderProgram.use();
    return {
        render() {
            renderProgram.use();
            quadBuffer.render();
        }
    };
}

const TEST_SHADER = `
vec2 R; int I;
#define A(U) texture(iChannel0,(U)/R)
#define B(U) texture(iChannel1,(U)/R)
#define C(U) texture(iChannel2,(U)/R)
#define D(U) texture(iChannel3,(U)/R)
#define Main void mainImage(out vec4 Q, in vec2 U) { R = iResolution.xy; I = iFrame;
float G2 (float w, float s) {
    return 0.15915494309*exp(-.5*w*w/s/s)/(s*s);
}
float G1 (float w, float s) {
    return 0.3989422804*exp(-.5*w*w/s/s)/(s);
}
float heart (vec2 u) {
    u -= vec2(.5,.4)*R;
    u.y -= 10.*sqrt(abs(u.x));
    u.y *= 1.;
    u.x *= .8;
    if (length(u)<.35*R.y) return 1.;
    else return 0.;
}

float _12(vec2 U) {

    return clamp(floor(U.x)+floor(U.y)*R.x,0.,R.x*R.y);

}

vec2 _21(float i) {

    return clamp(vec2(mod(i,R.x),floor(i/R.x))+.5,vec2(0),R);

}

float sg (vec2 p, vec2 a, vec2 b) {
    float i = clamp(dot(p-a,b-a)/dot(b-a,b-a),0.,1.);
\tfloat l = (length(p-a-(b-a)*i));
    return l;
}

float hash (vec2 p)
{
\tvec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p)
{
    vec4 w = vec4(
        floor(p),
        ceil (p)  );
    float 
        _00 = hash(w.xy),
        _01 = hash(w.xw),
        _10 = hash(w.zy),
        _11 = hash(w.zw),
    _0 = mix(_00,_01,fract(p.y)),
    _1 = mix(_10,_11,fract(p.y));
    return mix(_0,_1,fract(p.x));
}
float fbm (vec2 p) {
    float o = 0.;
    for (float i = 0.; i < 3.; i++) {
        o += noise(.1*p)/3.;
        o += .2*exp(-2.*abs(sin(.02*p.x+.01*p.y)))/3.;
        p *= 2.;
    }
    return o;
}
vec2 grad (vec2 p) {
    float 
    n = fbm(p+vec2(0,1)),
    e = fbm(p+vec2(1,0)),
    s = fbm(p-vec2(0,1)),
    w = fbm(p-vec2(1,0));
    return vec2(e-w,n-s);
}
#define keyClick(a)   ( texelFetch(iChannel2,ivec2(a,0),0).x > 0.)

#define  k ( .02 * R.x*R.y )
Main 
    float i = _12(U);
    Q = A(U);
    
    vec2 f = vec2(0);
    
    if ( i < k ) {
    for (float j = -20.; j <= 20.; j++) 
        if (j!=0.) {//  && j+i>=0. && j+i<R.x*R.y) {
        vec4 a = A(_21(mod(i+j,k)));
        //if (j!=0. && j+i>=0. && j+i<R.x*R.y) {
        //vec4 a = A(_21(i+j));
        vec2 r = a.xy-Q.xy;
        float l = length(r);
        f += 50.*r/sqrt(l)*(l-abs(j))*(G1(j,10.)+2.*G1(j,5.));
    }
    for (float x = -2.; x <= 2.; x++)
    for (float y = -2.; y <= 2.; y++) {
        vec2 u = vec2(x,y);
        vec4 d = D(Q.xy+u);
        f -= 100.*d.w*u;
    }
    if (length(f)>.1) f = .1*normalize(f);
    Q.zw += f-.03*Q.zw;
    Q.xy += f+1.5*Q.zw*inversesqrt(1.+dot(Q.zw,Q.zw));
    
    vec4 m = .5*( A(_21(i-1.)) + A(_21(i+1.)) );
    Q.zw = mix(Q.zw,m.zw,0.1);
    Q.xy = mix(Q.xy,m.xy,0.01);
    if (Q.x>R.x)Q.y=.5*R.y,Q.z=-10.;
    if (Q.x<0.)Q.y=.5*R.y,Q.z=10.;
    }
     if (iFrame < 1 || keyClick(32)) {
        if ( i > k ) 
          Q = vec4(R+i,0,0); 
        else
          Q = vec4(.5*R + .25*R.y* cos( 6.28*i/k + vec2(0,1.57)), 0,0 );
    //  Q = vec4(i-.5*R.x*R.y,.5*R.y,0,0);
    }
}
`