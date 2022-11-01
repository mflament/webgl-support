import {GLTexture2D} from "./GLTexture2D";
import {GLTextureCubemap} from "./GLTextureCubemap";
import {GLTexture3D} from "./GLTexture3D";
import {InternalFormat, TextureComponentType, TextureFormat} from "../GLEnums";

export type GLTexture = GLTexture2D | GLTextureCubemap | GLTexture3D;

export interface TexImageParam {
    internalFormat: InternalFormat;
    format: TextureFormat;
    type: TextureComponentType;
}

export interface TexSubImageParam {
    format: TextureFormat;
    type: TextureComponentType;
}

export interface TexImageOptions {
    bind?: boolean;
    mipmap?: boolean;
    flipY?: boolean;
    noColorSpaceConversion?: boolean;
    premultiplyAlpha?: boolean;
    unpackAlignment?: number;
}
