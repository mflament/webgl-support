import {TextureTarget} from "./GLTextureEnums";
import {AbstractGLTexture3D} from "./AbstractTexture3D";

export class GLTexture2DArray extends AbstractGLTexture3D {
    constructor(gl: WebGL2RenderingContext) {
        super(gl, TextureTarget.TEXTURE_2D_ARRAY);
    }
}
