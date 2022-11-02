import {safeCreate} from '../utils';
import {GLTexture} from '../texture';
import {glConstantName, TextureTarget} from "../GLEnums";


export type FrameBufferAttachment = { texture: GLTexture, target?: TextureTarget, level?: number } | null;

export class GLFrameBuffer {
    private readonly glFrameBuffer: WebGLFramebuffer;

    constructor(readonly gl: WebGL2RenderingContext) {
        this.glFrameBuffer = safeCreate(gl, 'createFramebuffer');
    }

    attach(...attachments: FrameBufferAttachment[]): void {
        const gl = this.gl;
        const drawBuffers: GLenum[] = [];
        for (let i = 0; i < attachments.length; i++) {
            const attachment = attachments[i];
            if (attachment) {
                const buffer = gl.COLOR_ATTACHMENT0 + i;
                drawBuffers.push(buffer);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, buffer, attachment.target || attachment.texture.target, attachment.texture.glTexture, attachment.level || 0);
            }
        }
        gl.drawBuffers(drawBuffers);
    }

    dettach(...attachments: FrameBufferAttachment[]): void {
        const gl = this.gl;
        for (let i = 0; i < attachments.length; i++) {
            const attachment = attachments[i];
            if (attachment) {
                const buffer = gl.COLOR_ATTACHMENT0 + i;
                gl.framebufferTexture2D(gl.FRAMEBUFFER, buffer, attachment.target || attachment.texture.target, null, attachment.level || 0);
            }
        }
        gl.drawBuffers([]);
    }

    bind(): void {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.glFrameBuffer);
    }

    unbind(): void {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    delete(): void {
        this.gl.deleteFramebuffer(this.glFrameBuffer);
    }

    checkStatus() {
        const gl = this.gl;
        let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE)
            throw new Error("Incomplete frame buffer : " + glConstantName(gl, status));
    }
}
