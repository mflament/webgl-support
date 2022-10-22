import {InternalFormat, PixelStoreParameter, TextureComponentType, TextureFormat, TextureTarget} from '../GLEnums';
import {check} from "../utils/GLUtils";
import {GLContext} from "../GLContext";

export interface GLTexture {
    target: TextureTarget;
    internalFormat: InternalFormat;
    format: TextureFormat;
    type: TextureComponentType;
    width: number;
    height: number;
    texture: WebGLTexture;
}

export interface GLTexture3D extends GLTexture {
    depth: number;
}

export type PixelStoreParameters = Record<PixelStoreParameter, number | boolean>;

export function setPixelStoreParameters(gl: WebGL2RenderingContext, parameters: PixelStoreParameters): void {
    for (const parameter in parameters)
        gl.pixelStorei(parameter as any, parameters[parameter]);
}

export interface TextureConfig extends Omit<GLTexture, "texture" | "width" | "height"> {
    vflip?: boolean;
    mipmap?: boolean;
    width?: number;
    height?: number;
}

export interface DataTextureConfig extends TextureConfig {
    width: number;
    height: number;
    data?: ArrayBufferView;
    srcOffset?: number;
    alignment?: number;
}

export interface ImageTextureConfig extends TextureConfig {
    source: TexImageSource;
    premultiplyAlpha?: boolean;
}

export interface PBOTextureConfig extends TextureConfig {
    width: number;
    height: number;
    pboOffset: number;
}

export interface Texture3DConfig extends TextureConfig {
    width: number;
    height: number;
    depth: number;
}

export interface DataTexture3DConfig extends DataTextureConfig, Texture3DConfig {
}

export interface PBOTexture3DConfig extends PBOTextureConfig, Texture3DConfig {
}

export class GLTextures {
    constructor(readonly glContext: GLContext) {
    }

    createTexture( config: DataTextureConfig | ImageTextureConfig | PBOTextureConfig): GLTexture;
    createTexture( config: DataTexture3DConfig | PBOTexture3DConfig): GLTexture3D;
    createTexture( config: DataTextureConfig | ImageTextureConfig | PBOTextureConfig | DataTexture3DConfig | PBOTexture3DConfig): GLTexture | GLTexture3D {
        const texture: GLTexture = {
            target: config.target, format: config.format, internalFormat: config.internalFormat, type: config.type,
            width: isImageConfig(config) ? config.source.width : config.width,
            height: isImageConfig(config) ? config.source.height : config.height,
            texture: check(this.glContext.gl.createTexture(), "Texture")
        }
        if (isTexture3DConfig(config))
            (texture as GLTexture3D).depth = config.depth;

        return this.updateTexture(texture, config);
    }

    updateTexture(texture: GLTexture3D, config: DataTexture3DConfig | PBOTexture3DConfig): GLTexture3D;
    updateTexture(texture: GLTexture, config: DataTextureConfig | ImageTextureConfig | PBOTextureConfig): GLTexture;
    updateTexture(texture: GLTexture | GLTexture3D, config: DataTextureConfig | ImageTextureConfig | PBOTextureConfig | DataTexture3DConfig | PBOTexture3DConfig): GLTexture | GLTexture3D {
        const {gl, glState} = this.glContext;
        const target = config.target;

        let update, alignment, premultiplyAlpha, vflip = config.vflip, mipmap = config.mipmap;

        glState.bindTexture(target, texture);
        if (target === TextureTarget.GL_TEXTURE_2D) {
            if (isImageConfig(config)) {
                texture.width = config.source.width
                texture.height = config.source.height;
                update = () => gl.texImage2D(gl.TEXTURE_2D, 0, config.internalFormat, config.format, config.type, config.source);
                premultiplyAlpha = config.premultiplyAlpha;
            } else {
                if (isPBOConfig(config)) {
                    update = () => gl.texImage2D(target, 0, config.internalFormat, config.width, config.height, 0, config.format, config.type, config.pboOffset);
                } else {
                    const {data, srcOffset} = config;
                    if (data) {
                        update = () => gl.texImage2D(target, 0, config.internalFormat, config.width, config.height, 0, config.format, config.type, data, srcOffset || 0);
                        alignment = config.alignment;
                    } else {
                        vflip = mipmap = false;
                        update = () => gl.texImage2D(target, 0, config.internalFormat, config.width, config.height, 0, config.format, config.type, null);
                    }
                }
            }
        } else if (isTexture3DConfig(config)) {
            if (isImageConfig(config)) {
                throw new Error("Can not create texture 3D from image");
            } else {
                vflip = false;
                const depth = config.depth || 0;
                if (isPBOConfig(config)) {
                    update = () => gl.texImage3D(target, 0, config.internalFormat, config.width, config.height, depth, 0, config.format, config.type, config.pboOffset);
                } else {
                    const {data, srcOffset} = config;
                    if (data) {
                        update = () => gl.texImage3D(target, 0, config.internalFormat, config.width, config.height, depth, 0, config.format, config.type, data, srcOffset || 0);
                        alignment = config.alignment;
                    } else {
                        mipmap = false;
                        update = () => gl.texImage3D(target, 0, config.internalFormat, config.width, config.height, depth, 0, config.format, config.type, null);
                    }
                }
            }
        } else {
            throw new Error("Unhandled target " + target);
        }

        if (vflip) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        if (typeof alignment === "number") gl.pixelStorei(gl.UNPACK_ALIGNMENT, alignment);
        if (premultiplyAlpha) gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

        update();

        mipmap && gl.generateMipmap(target);

        if (vflip) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        if (typeof alignment === "number") gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        if (premultiplyAlpha) gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

        glState.bindTexture(target, null);

        return texture;
    }


}

function isTexture3DConfig(config: any): config is Texture3DConfig {
    return typeof (config as Partial<Texture3DConfig>).depth === "number";
}

function isImageConfig(config: any): config is ImageTextureConfig {
    return typeof (config as Partial<ImageTextureConfig>).source === "object";
}

function isPBOConfig(config: any): config is PBOTextureConfig {
    return typeof (config as Partial<PBOTextureConfig>).pboOffset === "number";
}
