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
const float[1] map = float[1] (0.0);
void test() {
    for (int i = 0; i < map.length(); i++) {
    }
}
`