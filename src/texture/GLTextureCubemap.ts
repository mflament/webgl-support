import {TextureTarget} from "../GLEnums";
import {AbstractGLTexture} from "./AbstractGLTexture";
import {GLTexture2D, isTexWithSize, Tex2DWithSize, TexSubImage2DParam} from "./GLTexture2D";
import {hasProp} from "../utils";
import {TexImageParam} from "./GLTexture";

type TexCubemapWithSources = { width?: number, height?: number, sources: TexImageSource[]; }
type TexCubemapParams = Tex2DWithSize | TexCubemapWithSources

type TexImageCubemapParam = TexImageParam & TexCubemapParams;
type TexSubImageCubemapParam = TexSubImage2DParam & { face: number };

export class GLTextureCubemap extends AbstractGLTexture<TexImageCubemapParam, TexSubImageCubemapParam> {

    constructor(gl: WebGL2RenderingContext) {
        super(gl, TextureTarget.TEXTURE_CUBE_MAP);
    }

    protected doTexImage(param: TexImageCubemapParam): void {
        const gl = this.gl;
        const {internalFormat, format, type} = param;
        let width, height;
        if (this.isTexCubemapWithSource(param)) {
            width = param.width || param.sources[0].width;
            height = param.height || param.sources[1].height;
            for (let i = 0; i < 6; i++)
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, internalFormat, width, height, 0, format, type, param.sources[i]);
        } else if (isTexWithSize(param)) {
            width = param.width;
            height = param.height;
            for (let i = 0; i < 6; i++)
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, internalFormat, width, height, 0, format, type, null);
        } else
            throw new Error("invalid cubemap texImage param");

        this._width = width;
        this._height = height;
    }

    protected doTexSubImage(param: TexSubImageCubemapParam): void {
        const sp = {level: 0, xoffset: 0, yoffset: 0, width: this._width, height: this._height, srcOffset: 0, ...param};
        GLTexture2D.texSubImage(this.gl, this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + param.face, sp);
    }

    private isTexCubemapWithSource(param: TexCubemapParams): param is TexCubemapWithSources {
        return hasProp<TexCubemapWithSources>(param, "sources", "array");
    }

}