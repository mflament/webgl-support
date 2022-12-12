import {
    BufferTarget,
    BufferUsage,
    createQuadProgramAsync,
    FloatAttributeType,
    GLBuffer,
    GLContext,
    GLFrameBuffer,
    GLProgram,
    GLTexture2D,
    GLTransformFeedback,
    GLVertexArray,
    InternalFormat,
    QuadBuffer,
    SamplerConfig,
    TextureComponentType,
    TextureFormat,
    TextureMagFilter,
    TextureMinFilter,
    TextureWrappingMode,
    TFBPrimitiveMode,
    TransformFeedbackBufferMode
} from "../../../src";

const points = 10;

// language=glsl
const RENDER_POSITIONS_VS = `
    #version 300 es
    precision highp float;
    uniform sampler2D uPositions;
    in vec3 aPos;
    flat out int vertexID;
    void main() {
        vertexID = gl_VertexID;
        // int tWidth = textureSize(uPositions, 0).x;
        // ivec2 tCoord = ivec2(vertexID % tWidth, vertexID / tWidth);
        // vec3 pos = texelFetch(uPositions, tCoord, 0).rgb;
        vec3 pos = vec3(float(vertexID) / 9.0 * 2.0 - 1.0, 0.0, 0.0);
        gl_Position = vec4(pos, 1.0);
    }
`

// language=glsl
const RENDER_POSITIONS_FS = `
    #version 300 es
    precision highp float;

    flat in int vertexID;

    layout(location = 0) out int fragVertexID;

    void main() { fragVertexID = vertexID; }
`

// language=glsl
const DRAW_VERTEX_IDS_FS = `
    #version 300 es
    precision highp float;
    precision highp isampler2D;

    uniform isampler2D uVertexIDs;

    in vec2 uv;
    out vec4 color;

    void main() {
        int vid = texture(uVertexIDs, uv).r;
        color = vec4(vec3(vid) / 9.0, 1.0);
    }
`

export async function createTransformFeedbackSandbox(glc: GLContext) {
    const gl = glc.gl;

    gl.getExtension("EXT_color_buffer_float");
    gl.getExtension("EXT_float_blend");

    const qbuffer = new QuadBuffer(gl);
    const useTFB = true;

    function create() {
        const program = new GLProgram(gl);
        const varyings = useTFB ? {
            names: ['vertexID'],
            bufferMode: TransformFeedbackBufferMode.SEPARATE_ATTRIBS
        } : undefined;
        const cr = program.compile({vs: RENDER_POSITIONS_VS, fs: RENDER_POSITIONS_FS}, varyings);
        if (cr.hasError())
            throw cr.formatLogs();

        const samplerConfig: SamplerConfig = {
            filter: {
                minFilter: TextureMinFilter.NEAREST,
                magFilter: TextureMagFilter.NEAREST
            }, wrap: TextureWrappingMode.CLAMP_TO_EDGE
        }

        const positionsTexture = new GLTexture2D(gl);
        const positions = new Float32Array(4 * points);
        for (let i = 0; i < points; i++) {
            positions[i * 4] = (i + 0.5) / points * 2 - 1;
            positions[i * 4 + 2] = positions[i * 4];
        }
        positionsTexture.texImage({
            internalFormat: InternalFormat.RGBA32F, format: TextureFormat.RGBA, type: TextureComponentType.FLOAT,
            width: points, height: 1, srcData: positions
        }, {bind: true, samplerConfig});

        const outputTexture = new GLTexture2D(gl);
        outputTexture.texImage({
            internalFormat: InternalFormat.R32I, format: TextureFormat.RED_INTEGER, type: TextureComponentType.INT,
            width: points, height: 1
        }, {bind: true, samplerConfig});

        // gl.enable(gl.DEPTH_TEST);
        // const depthBuffer = gl.createRenderbuffer();
        // gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        // gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, points, 1);

        const framebuffer = new GLFrameBuffer(gl);
        framebuffer.bind();
        framebuffer.attach(outputTexture);
        // gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

        let tfb: GLTransformFeedback | undefined = undefined;
        let outputBuffer;
        if (useTFB) {
            tfb = new GLTransformFeedback(gl);
            tfb.bind();
            outputBuffer = new GLBuffer(gl);
            outputBuffer.bind(BufferTarget.ARRAY_BUFFER);
            outputBuffer.bufferData(4 * points, BufferUsage.STATIC_DRAW);
            outputBuffer.unbind(BufferTarget.ARRAY_BUFFER);
            tfb.bindBufferBase(0, outputBuffer);
        }

        gl.viewport(0, 0, points, 1);

        program.use();

        gl.activeTexture(gl.TEXTURE0);
        positionsTexture.bind();
        gl.uniform1i(program.getUniformLocation('uPositions'), 0);

        const vbo = new GLBuffer(gl);
        vbo.bind(BufferTarget.ARRAY_BUFFER);
        vbo.bufferData(points * 3 * 4, BufferUsage.STATIC_DRAW);
        vbo.unbind(BufferTarget.ARRAY_BUFFER);
        const vao = new GLVertexArray(gl);
        vao.bind();
        vao.vertexAttribPointer(vbo, 0, 3, FloatAttributeType.FLOAT, false, 0, 0);

        tfb?.begin(TFBPrimitiveMode.POINTS);

        gl.drawArrays(gl.POINTS, 0, points);

        vao.unbind();

        if (tfb && outputBuffer) {
            tfb.end();
            tfb.unbind();
            const vertexIds = new Int32Array(points);
            outputBuffer.bind(BufferTarget.ARRAY_BUFFER);
            outputBuffer.getBufferSubData(0, vertexIds, 0);
            outputBuffer.unbind(BufferTarget.ARRAY_BUFFER);
            console.log('tfb vertexIds', vertexIds);
        }

        const vertexIds = new Int32Array(points);
        gl.readPixels(0, 0, points, 1, gl.RED_INTEGER, gl.INT, vertexIds);
        console.log('framebuffer vertexIds', vertexIds);

        program.delete();
        positionsTexture.delete();
        framebuffer?.delete();
        tfb?.delete();
        // gl.deleteRenderbuffer(depthBuffer);
        return outputTexture;
    }

    const texture = create();
    const program = await createQuadProgramAsync(gl, {fs: DRAW_VERTEX_IDS_FS});
    program.use();
    gl.uniform1i(program.getUniformLocation('uVertexIDs'), 0);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    return {
        render() {
            gl.activeTexture(gl.TEXTURE0);
            texture.bind();
            qbuffer.render();
        }
    };
}