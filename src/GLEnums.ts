//////////// buffers ///////////////

export enum BufferUsage {
  STATIC_DRAW = WebGL2RenderingContext.STATIC_DRAW,
  DYNAMIC_DRAW = WebGL2RenderingContext.DYNAMIC_DRAW,
  STREAM_DRAW = WebGL2RenderingContext.STREAM_DRAW,
  STATIC_READ = WebGL2RenderingContext.STATIC_READ,
  DYNAMIC_READ = WebGL2RenderingContext.DYNAMIC_READ,
  STREAM_READ = WebGL2RenderingContext.STREAM_READ,
  STATIC_COPY = WebGL2RenderingContext.STATIC_COPY,
  DYNAMIC_COPY = WebGL2RenderingContext.DYNAMIC_COPY,
  STREAM_COPY = WebGL2RenderingContext.STREAM_COPY
}

export enum BufferTarget {
  ARRAY_BUFFER = WebGL2RenderingContext.ARRAY_BUFFER,
  ELEMENT_ARRAY_BUFFER = WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER,
  COPY_READ_BUFFER = WebGL2RenderingContext.COPY_READ_BUFFER,
  COPY_WRITE_BUFFER = WebGL2RenderingContext.COPY_WRITE_BUFFER,
  TRANSFORM_FEEDBACK_BUFFER = WebGL2RenderingContext.TRANSFORM_FEEDBACK_BUFFER,
  UNIFORM_BUFFER = WebGL2RenderingContext.UNIFORM_BUFFER,
  PIXEL_PACK_BUFFER = WebGL2RenderingContext.PIXEL_PACK_BUFFER,
  PIXEL_UNPACK_BUFFER = WebGL2RenderingContext.PIXEL_UNPACK_BUFFER
}

export enum VaryingBufferMode {
  INTERLEAVED_ATTRIBS = WebGL2RenderingContext.INTERLEAVED_ATTRIBS,
  SEPARATE_ATTRIBS = WebGL2RenderingContext.SEPARATE_ATTRIBS
}

export enum FloatPointerType {
  BYTE = WebGL2RenderingContext.BYTE,
  UNSIGNED_BYTE = WebGL2RenderingContext.UNSIGNED_BYTE,
  SHORT = WebGL2RenderingContext.SHORT,
  UNSIGNED_SHORT = WebGL2RenderingContext.UNSIGNED_SHORT,
  FLOAT = WebGL2RenderingContext.FLOAT,
  HALF_FLOAT = WebGL2RenderingContext.HALF_FLOAT
}

export enum IntPointerType {
  BYTE = WebGL2RenderingContext.BYTE,
  UNSIGNED_BYTE = WebGL2RenderingContext.UNSIGNED_BYTE,
  SHORT = WebGL2RenderingContext.SHORT,
  UNSIGNED_SHORT = WebGL2RenderingContext.UNSIGNED_SHORT,
  INT = WebGL2RenderingContext.INT,
  UNSIGNED_INT = WebGL2RenderingContext.UNSIGNED_INT
}

export enum IndexType {
  UNSIGNED_BYTE = WebGL2RenderingContext.UNSIGNED_BYTE,
  UNSIGNED_SHORT = WebGL2RenderingContext.UNSIGNED_SHORT,
  UNSIGNED_INT = WebGL2RenderingContext.UNSIGNED_INT
}

//////////// textures ///////////////

export enum InternalFormat {
  RGBA = WebGL2RenderingContext.RGBA,
  RGB = WebGL2RenderingContext.RGB,
  LUMINANCE_ALPHA = WebGL2RenderingContext.LUMINANCE_ALPHA,
  LUMINANCE = WebGL2RenderingContext.LUMINANCE,
  ALPHA = WebGL2RenderingContext.ALPHA,
  DEPTH_COMPONENT16 = WebGL2RenderingContext.DEPTH_COMPONENT16,
  DEPTH_COMPONENT24 = WebGL2RenderingContext.DEPTH_COMPONENT24,
  DEPTH_COMPONENT32F = WebGL2RenderingContext.DEPTH_COMPONENT32F,
  DEPTH_STENCIL = WebGL2RenderingContext.DEPTH_STENCIL,
  R8 = WebGL2RenderingContext.R8,
  R8_SNORM = WebGL2RenderingContext.R8_SNORM,
  RG8 = WebGL2RenderingContext.RG8,
  RG8_SNORM = WebGL2RenderingContext.RG8_SNORM,
  RGB8 = WebGL2RenderingContext.RGB8,
  RGB8_SNORM = WebGL2RenderingContext.RGB8_SNORM,
  RGB565 = WebGL2RenderingContext.RGB565,
  RGBA4 = WebGL2RenderingContext.RGBA4,
  RGB5_A1 = WebGL2RenderingContext.RGB5_A1,
  RGBA8 = WebGL2RenderingContext.RGBA8,
  RGBA8_SNORM = WebGL2RenderingContext.RGBA8_SNORM,
  RGB10_A2 = WebGL2RenderingContext.RGB10_A2,
  RGB10_A2UI = WebGL2RenderingContext.RGB10_A2UI,
  SRGB8 = WebGL2RenderingContext.SRGB8,
  SRGB8_ALPHA8 = WebGL2RenderingContext.SRGB8_ALPHA8,
  R16F = WebGL2RenderingContext.R16F,
  RG16F = WebGL2RenderingContext.RG16F,
  RGB16F = WebGL2RenderingContext.RGB16F,
  RGBA16F = WebGL2RenderingContext.RGBA16F,
  R32F = WebGL2RenderingContext.R32F,
  RG32F = WebGL2RenderingContext.RG32F,
  RGB32F = WebGL2RenderingContext.RGB32F,
  RGBA32F = WebGL2RenderingContext.RGBA32F,
  R11F_G11F_B10F = WebGL2RenderingContext.R11F_G11F_B10F,
  RGB9_E5 = WebGL2RenderingContext.RGB9_E5,
  R8I = WebGL2RenderingContext.R8I,
  R8UI = WebGL2RenderingContext.R8UI,
  R16I = WebGL2RenderingContext.R16I,
  R16UI = WebGL2RenderingContext.R16UI,
  R32I = WebGL2RenderingContext.R32I,
  R32UI = WebGL2RenderingContext.R32UI,
  RG8I = WebGL2RenderingContext.RG8I,
  RG8UI = WebGL2RenderingContext.RG8UI,
  RG16I = WebGL2RenderingContext.RG16I,
  RG16UI = WebGL2RenderingContext.RG16UI,
  RG32I = WebGL2RenderingContext.RG32I,
  RG32UI = WebGL2RenderingContext.RG32UI,
  RGB8I = WebGL2RenderingContext.RGB8I,
  RGB8UI = WebGL2RenderingContext.RGB8UI,
  RGB16I = WebGL2RenderingContext.RGB16I,
  RGB16UI = WebGL2RenderingContext.RGB16UI,
  RGB32I = WebGL2RenderingContext.RGB32I,
  RGB32UI = WebGL2RenderingContext.RGB32UI,
  RGBA8I = WebGL2RenderingContext.RGBA8I,
  RGBA8UI = WebGL2RenderingContext.RGBA8UI,
  RGBA16I = WebGL2RenderingContext.RGBA16I,
  RGBA16UI = WebGL2RenderingContext.RGBA16UI,
  RGBA32I = WebGL2RenderingContext.RGBA32I,
  RGBA32UI = WebGL2RenderingContext.RGBA32UI
}

export enum TextureFormat {
  RGB = WebGL2RenderingContext.RGB,
  RGBA = WebGL2RenderingContext.RGBA,
  LUMINANCE_ALPHA = WebGL2RenderingContext.LUMINANCE_ALPHA,
  LUMINANCE = WebGL2RenderingContext.LUMINANCE,
  ALPHA = WebGL2RenderingContext.ALPHA,
  RED = WebGL2RenderingContext.RED,
  RED_INTEGER = WebGL2RenderingContext.RED_INTEGER,
  RG = WebGL2RenderingContext.RG,
  RG_INTEGER = WebGL2RenderingContext.RG_INTEGER,
  RGB_INTEGER = WebGL2RenderingContext.RGB_INTEGER,
  RGBA_INTEGER = WebGL2RenderingContext.RGBA_INTEGER
}

export enum TextureComponentType {
  BYTE = WebGL2RenderingContext.BYTE,
  UNSIGNED_BYTE = WebGL2RenderingContext.UNSIGNED_BYTE,
  SHORT = WebGL2RenderingContext.SHORT,
  UNSIGNED_SHORT = WebGL2RenderingContext.UNSIGNED_SHORT,
  UNSIGNED_SHORT_5_6_5 = WebGL2RenderingContext.UNSIGNED_SHORT_5_6_5,
  UNSIGNED_SHORT_5_5_5_1 = WebGL2RenderingContext.UNSIGNED_SHORT_5_5_5_1,
  UNSIGNED_SHORT_4_4_4_4 = WebGL2RenderingContext.UNSIGNED_SHORT_4_4_4_4,
  INT = WebGL2RenderingContext.INT,
  UNSIGNED_INT = WebGL2RenderingContext.UNSIGNED_INT,
  UNSIGNED_INT_5_9_9_9_REV = WebGL2RenderingContext.UNSIGNED_INT_5_9_9_9_REV,
  UNSIGNED_INT_2_10_10_10_REV = WebGL2RenderingContext.UNSIGNED_INT_2_10_10_10_REV,
  UNSIGNED_INT_10F_11F_11F_REV = WebGL2RenderingContext.UNSIGNED_INT_10F_11F_11F_REV,
  UNSIGNED_INT_24_8 = WebGL2RenderingContext.UNSIGNED_INT_24_8,
  HALF_FLOAT = WebGL2RenderingContext.HALF_FLOAT,
  FLOAT = WebGL2RenderingContext.FLOAT
}

export enum TextureParameter {
  BASE_LEVEL = WebGL2RenderingContext.TEXTURE_BASE_LEVEL,
  COMPARE_FUNC = WebGL2RenderingContext.TEXTURE_COMPARE_FUNC,
  COMPARE_MODE = WebGL2RenderingContext.TEXTURE_COMPARE_MODE,
  MIN_FILTER = WebGL2RenderingContext.TEXTURE_MIN_FILTER,
  MAG_FILTER = WebGL2RenderingContext.TEXTURE_MAG_FILTER,
  MIN_LOD = WebGL2RenderingContext.TEXTURE_MIN_LOD,
  MAX_LOD = WebGL2RenderingContext.TEXTURE_MAX_LOD,
  MAX_LEVEL = WebGL2RenderingContext.TEXTURE_MAX_LEVEL,
  WRAP_S = WebGL2RenderingContext.TEXTURE_WRAP_S,
  WRAP_T = WebGL2RenderingContext.TEXTURE_WRAP_T,
  WRAP_R = WebGL2RenderingContext.TEXTURE_WRAP_R
}

export enum TextureMinFilter {
  NEAREST = WebGL2RenderingContext.NEAREST,
  LINEAR = WebGL2RenderingContext.LINEAR,
  NEAREST_MIPMAP_NEAREST = WebGL2RenderingContext.NEAREST_MIPMAP_NEAREST,
  LINEAR_MIPMAP_NEAREST = WebGL2RenderingContext.LINEAR_MIPMAP_NEAREST,
  NEAREST_MIPMAP_LINEAR = WebGL2RenderingContext.NEAREST_MIPMAP_LINEAR,
  LINEAR_MIPMAP_LINEAR = WebGL2RenderingContext.LINEAR_MIPMAP_LINEAR
}

export enum TextureMagFilter {
  NEAREST = WebGL2RenderingContext.NEAREST,
  LINEAR = WebGL2RenderingContext.LINEAR
}

export enum TextureWrappingMode {
  CLAMP_TO_EDGE = WebGL2RenderingContext.CLAMP_TO_EDGE,
  MIRRORED_REPEAT = WebGL2RenderingContext.MIRRORED_REPEAT,
  REPEAT = WebGL2RenderingContext.REPEAT
}

export enum PixelStoreParameter {
  PACK_ROW_LENGTH = WebGL2RenderingContext.PACK_ROW_LENGTH,
  PACK_SKIP_PIXELS = WebGL2RenderingContext.PACK_SKIP_PIXELS,
  PACK_SKIP_ROWS = WebGL2RenderingContext.PACK_SKIP_ROWS,
  PACK_ALIGNMENT = WebGL2RenderingContext.PACK_ALIGNMENT,

  UNPACK_ROW_LENGTH = WebGL2RenderingContext.UNPACK_ROW_LENGTH,
  UNPACK_IMAGE_HEIGHT = WebGL2RenderingContext.UNPACK_IMAGE_HEIGHT,
  UNPACK_SKIP_PIXELS = WebGL2RenderingContext.UNPACK_SKIP_PIXELS,
  UNPACK_SKIP_ROWS = WebGL2RenderingContext.UNPACK_SKIP_ROWS,
  UNPACK_SKIP_IMAGES = WebGL2RenderingContext.UNPACK_SKIP_IMAGES,
  UNPACK_ALIGNMENT = WebGL2RenderingContext.UNPACK_ALIGNMENT,
  UNPACK_FLIP_Y_WEBGL = WebGL2RenderingContext.UNPACK_FLIP_Y_WEBGL,
  UNPACK_PREMULTIPLY_ALPHA_WEBGL = WebGL2RenderingContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
  UNPACK_COLORSPACE_CONVERSION_WEBGL = WebGL2RenderingContext.UNPACK_COLORSPACE_CONVERSION_WEBGL
}

//////////////// frame buffer ///////////////////

export enum FrameBufferStatus {
  COMPLETE = WebGL2RenderingContext.FRAMEBUFFER_COMPLETE,
  INCOMPLETE_ATTACHMENT = WebGL2RenderingContext.FRAMEBUFFER_INCOMPLETE_ATTACHMENT,
  MISSING_ATTACHMENT = WebGL2RenderingContext.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT,
  INCOMPLETE_DIMENSIONS = WebGL2RenderingContext.FRAMEBUFFER_INCOMPLETE_DIMENSIONS,
  UNSUPPORTED = WebGL2RenderingContext.FRAMEBUFFER_UNSUPPORTED,
  INCOMPLETE_MULTISAMPLE = WebGL2RenderingContext.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE
}

export function frameBufferStatusName(status: FrameBufferStatus): string {
  switch (status) {
    case FrameBufferStatus.COMPLETE:
      return 'COMPLETE';
    case FrameBufferStatus.INCOMPLETE_ATTACHMENT:
      return 'INCOMPLETE_ATTACHMENT';
    case FrameBufferStatus.MISSING_ATTACHMENT:
      return 'MISSING_ATTACHMENT';
    case FrameBufferStatus.INCOMPLETE_DIMENSIONS:
      return 'INCOMPLETE_DIMENSIONS';
    case FrameBufferStatus.UNSUPPORTED:
      return 'UNSUPPORTED';
    case FrameBufferStatus.INCOMPLETE_MULTISAMPLE:
      return 'INCOMPLETE_MULTISAMPLE';
    default:
      return 'Uknown status ' + status;
  }
}
