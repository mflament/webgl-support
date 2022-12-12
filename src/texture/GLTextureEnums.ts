
export enum TextureTarget {
    TEXTURE_2D = WebGL2RenderingContext.TEXTURE_2D,
    TEXTURE_3D = WebGL2RenderingContext.TEXTURE_3D,
    TEXTURE_2D_ARRAY = WebGL2RenderingContext.TEXTURE_2D_ARRAY,
    TEXTURE_CUBE_MAP = WebGL2RenderingContext.TEXTURE_CUBE_MAP,
    TEXTURE_CUBE_MAP_NEGATIVE_X = WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X,
    TEXTURE_CUBE_MAP_NEGATIVE_Y = WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    TEXTURE_CUBE_MAP_NEGATIVE_Z = WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z,
    TEXTURE_CUBE_MAP_POSITIVE_X = WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X,
    TEXTURE_CUBE_MAP_POSITIVE_Y = WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y,
    TEXTURE_CUBE_MAP_POSITIVE_Z = WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z,
}

export enum InternalFormat {
    RGBA = WebGL2RenderingContext.RGBA,
    RGB = WebGL2RenderingContext.RGB,
    LUMINANCE_ALPHA = WebGL2RenderingContext.LUMINANCE_ALPHA,
    LUMINANCE = WebGL2RenderingContext.LUMINANCE,
    ALPHA = WebGL2RenderingContext.ALPHA,
    DEPTH_COMPONENT16 = WebGL2RenderingContext.DEPTH_COMPONENT16,
    DEPTH_COMPONENT24 = WebGL2RenderingContext.DEPTH_COMPONENT24,
    DEPTH_COMPONENT32F = WebGL2RenderingContext.DEPTH_COMPONENT32F,
    DEPTH24_STENCIL8 = WebGL2RenderingContext.DEPTH24_STENCIL8,
    DEPTH32F_STENCIL8 = WebGL2RenderingContext.DEPTH32F_STENCIL8,
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
    DEPTH_COMPONENT = WebGL2RenderingContext.DEPTH_COMPONENT,
    DEPTH_STENCIL = WebGL2RenderingContext.DEPTH_STENCIL,
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
