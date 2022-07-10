import {GLTexture} from '../texture/GLTexture';
import {check} from '../utils/GLUtils';
import {GLContext} from '../GLContext';

export class GLFrameBuffer {
    private readonly frameBuffer: WebGLFramebuffer;

    constructor(readonly context: GLContext) {
        this.frameBuffer = check(context.gl.createFramebuffer(), 'frame buffer');
    }

    render(renderTexture: (w: number, h: number) => void, ...targets: GLTexture[]): void {
        if (targets.length === 0) return;

        const {gl, glState} = this.context;
        glState.bindFrameBuffer(this.frameBuffer);
        const attachments: number[] = [];
        for (let i = 0; i < targets.length; i++) {
            attachments[i] = gl.COLOR_ATTACHMENT0 + i;
            gl.framebufferTexture2D(gl.FRAMEBUFFER, attachments[i], gl.TEXTURE_2D, targets[i].texture, 0);
        }
        gl.drawBuffers(attachments);

        const {width, height} = targets[0];

        const vp = gl.getParameter(gl.VIEWPORT);
        gl.viewport(0, 0, width, height);

        renderTexture(width, height);

        for (let i = 0; i < targets.length; i++) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, null, 0);
        }
        glState.bindFrameBuffer(null);

        gl.viewport(vp[0], vp[1], vp[2], vp[3]);
    }

    delete(): void {
        this.context.gl.deleteFramebuffer(this.frameBuffer);
    }
}
