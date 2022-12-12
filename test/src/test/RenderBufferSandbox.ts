import {
    ColorAttachment,
    createQuadProgram,
    FrameBufferTarget,
    GLContext,
    GLFrameBuffer,
    GLSampler,
    GLTexture2D,
    InternalFormat,
    QuadBuffer,
    TextureAttachmentTarget,
    TextureComponentType,
    TextureFormat,
    TextureMagFilter,
    TextureMinFilter,
    TextureWrappingMode
} from "../../../src";

// language=glsl
const DRAW_FS = `
    #version 300 es
    precision highp float;

    uniform sampler2D iChannel0;

    in vec2 uv;
    out vec4 color;

    void main() {
        color = texture(iChannel0, uv);
    }
`

export async function createRenderbufferSandbox(glc: GLContext) {
    const {gl, canvas} = glc;

    const quadBuffer = new QuadBuffer(gl);
    const drawProgram = await createQuadProgram(gl, {fs: DRAW_FS});
    drawProgram.use();
    gl.uniform1i(drawProgram.getUniformLocation('iChannel0'), 0);
    gl.activeTexture(gl.TEXTURE0);

    const sampler = new GLSampler(gl);
    sampler.bind(0);
    sampler.setSamplerConfig({
        filter: {
            minFilter: TextureMinFilter.LINEAR_MIPMAP_LINEAR,
            magFilter: TextureMagFilter.LINEAR
        }, wrap: TextureWrappingMode.CLAMP_TO_EDGE
    });

    const createTexture = (width: number, height: number, levels = 1) => {
        const texture = new GLTexture2D(gl);
        texture.bind();
        texture.texStorage({internalFormat: gl.RGBA8, width, height, levels});
        texture.setSampler({
            filter: {minFilter: TextureMinFilter.NEAREST, magFilter: TextureMagFilter.NEAREST},
            wrap: TextureWrappingMode.CLAMP_TO_EDGE
        });
        texture.unbind();
        return texture;
    }

    const loadImage = (src: string): Promise<GLTexture2D> => {
        return new Promise((resolve, reject) => {
            const imageElement = document.createElement('img');
            imageElement.src = src;
            imageElement.onload = () => {
                const texture = new GLTexture2D(gl);
                texture.bind();
                texture.texImage({
                        internalFormat: InternalFormat.RGBA8,
                        format: TextureFormat.RGBA,
                        type: TextureComponentType.UNSIGNED_BYTE,
                        source: imageElement
                    },
                    {
                        mipmap: true,
                        flipY: true,
                        samplerConfig: {
                            filter: {
                                minFilter: TextureMinFilter.LINEAR_MIPMAP_LINEAR,
                                magFilter: TextureMagFilter.LINEAR
                            }, wrap: TextureWrappingMode.CLAMP_TO_EDGE
                        }
                    });
                texture.unbind();
                resolve(texture)
            };
            imageElement.onerror = reject;
        });
    }

    const texture0 = await loadImage('test.jpg');
    const width = 128, height = 128;

    const fb = new GLFrameBuffer(gl);
    fb.bind();

    const rb = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA8, 512, 512);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rb);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    gl.viewport(0, 0, width, height);
    texture0.bind();
    quadBuffer.render();

    const data = new Uint8ClampedArray(width * height * 4);
    gl.readBuffer(gl.COLOR_ATTACHMENT0);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
    fb.unbind();

    const texture2 = createTexture(128, 128, 8);
    texture2.bind();
    texture2.texSubImage({
        format: TextureFormat.RGBA,
        type: TextureComponentType.UNSIGNED_BYTE,
        width, height,
        srcData: data
    });

    gl.viewport(0, 0, canvas.width, canvas.height);

    return {
        render() {
            quadBuffer.render();
        }
    };
}