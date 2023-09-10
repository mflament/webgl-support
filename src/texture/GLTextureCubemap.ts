import {TextureTarget} from "./GLTextureEnums";
import {AbstractGLTexture, TexImageParam, TexStorageParam} from "./AbstractGLTexture";
import {GLTexture2D, isTexWithSize, TexSubImage2DParam} from "./GLTexture2D";
import {sourceHeight, sourceWidth} from "../utils";


type TexCubemapWithSources = { width?: number, height?: number, sources: TexImageSource[]; }
type TexCubemapParams = { width: number; height: number; } | TexCubemapWithSources

export type TexImageCubemapParam = TexImageParam & TexCubemapParams;
export type TexSubImageCubemapParam = TexSubImage2DParam & { face: number };

export class GLTextureCubemap extends AbstractGLTexture<TexImageCubemapParam, TexSubImageCubemapParam> {

    constructor(gl: WebGL2RenderingContext) {
        super(gl, TextureTarget.TEXTURE_CUBE_MAP);
    }

    texStorage(params: TexStorageParam): void {
        this.gl.texStorage2D(TextureTarget.TEXTURE_CUBE_MAP, params.levels, params.internalFormat, params.width, params.height);
        this._width = params.width;
        this._height = params.height;
    }

    protected doTexImage(param: TexImageCubemapParam): void {
        const gl = this.gl;
        const {internalFormat, format, type} = param;
        let width, height;
        if (this.isTexCubemapWithSources(param)) {
            width = param.width !== undefined ? param.width : sourceWidth(param.sources[0]);
                height = param.height !== undefined ? param.height : sourceHeight(param.sources[0]);
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

    private isTexCubemapWithSources(param: TexCubemapParams): param is TexCubemapWithSources {
        return "sources" in param && Array.isArray(param.sources);
    }

}