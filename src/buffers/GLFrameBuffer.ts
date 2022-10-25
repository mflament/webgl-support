import {safeCreate} from '../utils';
import {GLTexture2D} from '../texture';

export class GLFrameBuffer {
    private readonly glFrameBuffer: WebGLFramebuffer;

    constructor(readonly gl: WebGL2RenderingContext) {
        this.glFrameBuffer = safeCreate(gl, 'createFramebuffer');
    }

    render(renderTexture: (w: number, h: number) => void, ...targets: GLTexture2D[]): void {
        if (targets.length === 0)
            return;

        const gl = this.gl;

        this.bind();

        const attachments: number[] = [];
        for (let i = 0; i < targets.length; i++) {
            attachments[i] = gl.COLOR_ATTACHMENT0 + i;
            gl.framebufferTexture2D(gl.FRAMEBUFFER, attachments[i], gl.TEXTURE_2D, targets[i].glTexture, 0);
        }
        gl.drawBuffers(attachments);

        const {width, height} = targets[0];

        gl.viewport(0, 0, width, height);

        renderTexture(width, height);

        for (let i = 0; i < targets.length; i++) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, null, 0);
        }
        this.unbind();
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
}
