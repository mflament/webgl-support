import {TextureTarget} from "./GLTextureEnums";
import {AbstractGLTexture3D} from "./AbstractTexture3D";

export class GLTexture3D extends AbstractGLTexture3D {
    constructor(gl: WebGL2RenderingContext) {
        super(gl, TextureTarget.TEXTURE_3D);
    }
}
