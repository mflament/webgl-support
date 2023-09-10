import {glEnumName} from '../utils';
import {GLTexture, GLTexture2D} from '../texture';
import {AbstractGLTexture} from "../texture/AbstractGLTexture";

export enum FrameBufferTarget {
    FRAMEBUFFER = WebGL2RenderingContext.FRAMEBUFFER,
    DRAW_FRAMEBUFFER = WebGL2RenderingContext.DRAW_FRAMEBUFFER,
    READ_FRAMEBUFFER = WebGL2RenderingContext.READ_FRAMEBUFFER
}

export enum ColorAttachment {
    COLOR_ATTACHMENT0 = WebGL2RenderingContext.COLOR_ATTACHMENT0,
    COLOR_ATTACHMENT1 = WebGL2RenderingContext.COLOR_ATTACHMENT1,
    COLOR_ATTACHMENT2 = WebGL2RenderingContext.COLOR_ATTACHMENT2,
    COLOR_ATTACHMENT3 = WebGL2RenderingContext.COLOR_ATTACHMENT3,
    COLOR_ATTACHMENT4 = WebGL2RenderingContext.COLOR_ATTACHMENT4,
    COLOR_ATTACHMENT5 = WebGL2RenderingContext.COLOR_ATTACHMENT5,
    COLOR_ATTACHMENT6 = WebGL2RenderingContext.COLOR_ATTACHMENT6,
    COLOR_ATTACHMENT7 = WebGL2RenderingContext.COLOR_ATTACHMENT7,
    COLOR_ATTACHMENT8 = WebGL2RenderingContext.COLOR_ATTACHMENT8,
    COLOR_ATTACHMENT9 = WebGL2RenderingContext.COLOR_ATTACHMENT9,
    COLOR_ATTACHMENT10 = WebGL2RenderingContext.COLOR_ATTACHMENT10,
    COLOR_ATTACHMENT11 = WebGL2RenderingContext.COLOR_ATTACHMENT11,
    COLOR_ATTACHMENT12 = WebGL2RenderingContext.COLOR_ATTACHMENT12,
    COLOR_ATTACHMENT13 = WebGL2RenderingContext.COLOR_ATTACHMENT13,
    COLOR_ATTACHMENT14 = WebGL2RenderingContext.COLOR_ATTACHMENT14,
    COLOR_ATTACHMENT15 = WebGL2RenderingContext.COLOR_ATTACHMENT15,
}

export enum TextureAttachmentPoint {
    DEPTH_ATTACHMENT = WebGL2RenderingContext.DEPTH_ATTACHMENT,
    STENCIL_ATTACHMENT = WebGL2RenderingContext.STENCIL_ATTACHMENT,
    DEPTH_STENCIL_ATTACHMENT = WebGL2RenderingContext.DEPTH_STENCIL_ATTACHMENT,
}

export enum DrawBuffer {
    NONE = WebGL2RenderingContext.NONE,
    BACK = WebGL2RenderingContext.BACK,
}

export enum TextureAttachmentTarget {
    TEXTURE_2D = WebGL2RenderingContext.TEXTURE_2D,
    TEXTURE_CUBE_MAP_POSITIVE_X = WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X,
    TEXTURE_CUBE_MAP_NEGATIVE_X = WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X,
    TEXTURE_CUBE_MAP_POSITIVE_Y = WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y,
    TEXTURE_CUBE_MAP_NEGATIVE_Y = WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    TEXTURE_CUBE_MAP_POSITIVE_Z = WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z,
    TEXTURE_CUBE_MAP_NEGATIVE_Z = WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z
}

export type FrameBufferAttachment = { texture: GLTexture, attachmentPoint?: TextureAttachmentPoint | ColorAttachment, target?: TextureAttachmentTarget, level?: number };

function isFrameBufferAttachment(p: any): p is FrameBufferAttachment {
    return "texture" in p && p.texture instanceof AbstractGLTexture;
}

export class GLFrameBuffer {
    private _glFrameBuffer: WebGLFramebuffer | null;

    constructor(readonly gl: WebGL2RenderingContext) {
        this._glFrameBuffer = gl.createFramebuffer();
    }

    get glFrameBuffer(): WebGLFramebuffer {
        if (!this._glFrameBuffer)
            throw new Error("GLFrameBuffer is deleted");
        return this._glFrameBuffer;
    }

    get deleted(): boolean {
        return !this._glFrameBuffer;
    }

    delete(): void {
        if (this._glFrameBuffer) {
            this.gl.deleteFramebuffer(this._glFrameBuffer);
            this._glFrameBuffer = null;
        }
    }

    framebufferTexture2D(target: FrameBufferTarget,
                         attachment: TextureAttachmentPoint | ColorAttachment,
                         texture: WebGLTexture | GLTexture2D,
                         textureTarget = TextureAttachmentTarget.TEXTURE_2D,
                         level = 0): void {
        this.gl.framebufferTexture2D(target, attachment, textureTarget, texture instanceof GLTexture2D ? texture.glTexture : texture, level);
    }

    drawBuffers(buffers: (DrawBuffer | ColorAttachment)[]): void {
        this.gl.drawBuffers(buffers);
    }

    attach(...attachments: (FrameBufferAttachment | GLTexture | null)[]): void {
        const gl = this.gl;
        const drawBuffers: GLenum[] = []
        for (let i = 0; i < attachments.length; i++) {
            const attachment = attachments[i];
            if (attachment) {
                let texture, level, target, attachmentPoint;
                if (isFrameBufferAttachment(attachment)) {
                    texture = attachment.texture;
                    target = attachment.target || texture.target;
                    level = attachment.level || 0;
                    attachmentPoint = attachment.attachmentPoint || gl.COLOR_ATTACHMENT0 + i;
                    if (attachmentPoint >= ColorAttachment.COLOR_ATTACHMENT0 && attachmentPoint <= ColorAttachment.COLOR_ATTACHMENT15)
                        drawBuffers.push(attachmentPoint);
                } else {
                    texture = attachment;
                    target = texture.target;
                    level = 0;
                    attachmentPoint = gl.COLOR_ATTACHMENT0 + i;
                    drawBuffers.push(attachmentPoint);
                }
                gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, target, texture.glTexture, level);
            } else {
                drawBuffers.push(DrawBuffer.NONE);
            }
        }
        gl.drawBuffers(drawBuffers);
        this.checkStatus();
    }


    dettach(attachments: (FrameBufferAttachment | GLTexture | null)[]): void {
        const gl = this.gl;
        for (let i = 0; i < attachments.length; i++) {
            const attachment = attachments[i];
            if (attachment) {
                const buffer = gl.COLOR_ATTACHMENT0 + i;
                let target, level;
                if (isFrameBufferAttachment(attachment)) {
                    target = attachment.target || attachment.texture.target;
                    level = attachment.level || 0;
                } else {
                    target = attachment.target;
                    level = 0
                }
                gl.framebufferTexture2D(gl.FRAMEBUFFER, buffer, target, null, level);
            }
        }
        gl.drawBuffers([]);
    }

    invalidate(...attachments: (ColorAttachment | TextureAttachmentPoint)[]) {
        this.gl.invalidateFramebuffer(this.gl.FRAMEBUFFER, attachments);
    }

    bind(): void {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.glFrameBuffer);
    }

    unbind(): void {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    checkStatus() {
        const gl = this.gl;
        let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE)
            throw new Error("Incomplete frame buffer : " + glEnumName(status));
    }
}
