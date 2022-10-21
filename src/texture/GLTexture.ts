import {GLContext} from '../GLContext';
import {
    InternalFormat,
    PixelStoreParameter,
    TextureComponentType,
    TextureFormat,
    TextureMagFilter,
    TextureMinFilter,
    TextureParameter,
    TextureTarget,
    TextureWrappingMode
} from '../GLEnums';
import {check} from '../utils/GLUtils';

export interface GLTexture {
    readonly target: TextureTarget;
    readonly texture: WebGLTexture;
    readonly width: number;
    readonly height: number;
    readonly internalFormat: InternalFormat;
    readonly format: TextureFormat;
    readonly type: TextureComponentType;
}

export interface GLTexture3D extends GLTexture {
    readonly depth: number;
}

export function isGLTexture(obj: any): obj is GLTexture {
    const glt = obj as Partial<GLTexture>;
    return glt && typeof glt.texture === 'object' && typeof glt.width === 'number' && typeof glt.height === 'number';
}

export interface SamplerConfig {
    filter: {
        minFilter: TextureMinFilter;
        magFilter: TextureMagFilter
    }
    wrap: {
        s: TextureWrappingMode;
        t: TextureWrappingMode;
        w?: TextureWrappingMode
    }
}

export type PixelStoreParameters = Record<PixelStoreParameter, number | boolean>;

export interface TextureConfig {
    internalFormat: InternalFormat;
    format: TextureFormat;
    type: TextureComponentType;
    generateMipmap?: boolean;
    sampler?: Partial<SamplerConfig>;
    storeParameters?: PixelStoreParameters;
}

export interface DataTextureConfig extends TextureConfig {
    width: number;
    height: number;
    data?: ArrayBufferView | null;
    srcOffset?: number;
}

export interface ImageTextureConfig extends TextureConfig {
    width?: number;
    height?: number;
    source: TexImageSource;
}

export interface PBOTextureConfig extends TextureConfig {
    width: number;
    height: number;
    pboOffset: number;
}

export function setSamplerParameters(gl: WebGL2RenderingContext, target: TextureTarget, config: Partial<SamplerConfig>): void {
    if (config.filter?.minFilter)
        gl.texParameteri(target, TextureParameter.MIN_FILTER, config.filter.minFilter);

    if (config.filter?.magFilter)
        gl.texParameteri(target, TextureParameter.MAG_FILTER, config.filter.magFilter);

    if (config.wrap?.s)
        gl.texParameteri(target, TextureParameter.WRAP_S, config.wrap.s);
    if (config.wrap?.t)
        gl.texParameteri(target, TextureParameter.WRAP_T, config.wrap.t);
}

export function setPixelStoreParameters(gl: WebGL2RenderingContext, parameters: PixelStoreParameters): void {
    for (const parameter in parameters)
        gl.pixelStorei(parameter as any, parameters[parameter]);
}

export function createTexture2D(context: GLContext, config: DataTextureConfig | ImageTextureConfig | PBOTextureConfig): GLTexture {
    const {gl, glState} = context;
    let target = WebGL2RenderingContext.TEXTURE_2D;

    const texture = check(gl.createTexture(), 'texture');
    glState.bindTexture(TextureTarget.GL_TEXTURE_2D, texture);

    const {internalFormat, format, type} = config;
    let width: number;
    let height: number;
    let generateMipmap = false;

    if (config.sampler)
        setSamplerParameters(gl, target, config.sampler);

    if (config.storeParameters)
        setPixelStoreParameters(gl, config.storeParameters)

    if (isDataConfig(config)) {
        width = config.width;
        height = config.height;
        if (config.data)
            gl.texImage2D(target, 0, internalFormat, width, height, 0, format, type, config.data, config.srcOffset || 0);
        else gl.texImage2D(target, 0, internalFormat, width, height, 0, format, type, null);
    } else if (isImageConfig(config)) {
        width = config.width || config.source.width;
        height = config.height || config.source.height;
        gl.texImage2D(target, 0, internalFormat, width, height, 0, format, type, config.source);
        generateMipmap = true;
    } else {
        width = config.width;
        height = config.height;
        gl.texImage2D(target, 0, internalFormat, width, height, 0, format, type, config.pboOffset);
    }

    if (config.generateMipmap || generateMipmap) gl.generateMipmap(gl.TEXTURE_2D);

    return {target, texture, width, height, internalFormat, format, type};
}

function isDataConfig(config: TextureConfig): config is DataTextureConfig {
    const dtc = config as Partial<DataTextureConfig>;
    return typeof dtc.width === 'number' && typeof dtc.height === 'number' && typeof dtc.data === 'object';
}

function isImageConfig(config: TextureConfig): config is ImageTextureConfig {
    const dtc = config as Partial<ImageTextureConfig>;
    return typeof dtc.source === 'object';
}
