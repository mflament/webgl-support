import { GLContext } from './GLContext';
import {
  InternalFormat,
  PixelStoreParameter,
  TextureComponentType,
  TextureFormat,
  TextureMagFilter,
  TextureMinFilter,
  TextureParameter,
  TextureWrappingMode
} from './GLEnums';
import { check } from './GLUtils';

export interface GLTexture {
  readonly texture: WebGLTexture;
  readonly width: number;
  readonly height: number;
  readonly internalFormat: InternalFormat;
  readonly format: TextureFormat;
  readonly type: TextureComponentType;
}

export function isGLTexture(obj: any): obj is GLTexture {
  const glt = obj as Partial<GLTexture>;
  return glt && typeof glt.texture === 'object' && typeof glt.width === 'number' && typeof glt.height === 'number';
}

interface TextureConfig {
  internalFormat: InternalFormat;
  format: TextureFormat;
  type: TextureComponentType;
  filter?: { minFilter: TextureMinFilter; magFilter: TextureMagFilter };
  wrap?: { s: TextureWrappingMode; t: TextureWrappingMode };
  generateMipmap?: boolean;
  storeParameters?: Record<PixelStoreParameter, number | boolean>;
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

export function createTexture(
  context: GLContext,
  config: DataTextureConfig | ImageTextureConfig | PBOTextureConfig
): GLTexture {
  const { gl, glState } = context;
  const texture = check(gl.createTexture(), 'texture');
  glState.bindTexture2D(texture);

  if (config.filter?.minFilter) gl.texParameteri(gl.TEXTURE_2D, TextureParameter.MIN_FILTER, config.filter.minFilter);
  if (config.filter?.magFilter) gl.texParameteri(gl.TEXTURE_2D, TextureParameter.MAG_FILTER, config.filter.magFilter);

  if (config.wrap?.s) gl.texParameteri(gl.TEXTURE_2D, TextureParameter.WRAP_S, config.wrap.s);
  if (config.wrap?.t) gl.texParameteri(gl.TEXTURE_2D, TextureParameter.WRAP_T, config.wrap.t);

  if (config.storeParameters) {
    for (const storeParameter in config.storeParameters) {
      gl.pixelStorei(storeParameter as any, config.storeParameters[storeParameter])
    }
  }

  const { internalFormat, format, type } = config;
  let width: number;
  let height: number;
  let generateMipmap = false;

  const target = gl.TEXTURE_2D;
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

  return {
    texture: texture,
    width: width,
    height: height,
    internalFormat: internalFormat,
    format: format,
    type: type
  };
}

function isDataConfig(config: TextureConfig): config is DataTextureConfig {
  const dtc = config as Partial<DataTextureConfig>;
  return typeof dtc.width === 'number' && typeof dtc.height === 'number' && typeof dtc.data === 'object';
}

function isImageConfig(config: TextureConfig): config is ImageTextureConfig {
  const dtc = config as Partial<ImageTextureConfig>;
  return typeof dtc.source === 'object';
}
