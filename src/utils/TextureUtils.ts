import {check} from "./GLUtils";

export function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = url;
        image.onload = () => resolve(image);
        image.onerror = reject;
    });
}

export type TextureParams = {
    internal: GLenum,
    format: GLenum,
    type: GLenum,
    width: number,
    height: number,
    filter?: GLenum,
    wrap?: GLenum
};

export interface LoadedTexture {
    texture: WebGLTexture;
    params: TextureParams;
}

export function createTexture(gl: WebGL2RenderingContext, format: Omit<TextureParams, 'width' | 'height'> & {
    source: TexImageSource,
    flip?: boolean
}): LoadedTexture;
export function createTexture(gl: WebGL2RenderingContext, format: TextureParams & {
    data?: ArrayBuffer
}): LoadedTexture;
export function createTexture(gl: WebGL2RenderingContext, params: any): LoadedTexture {
    const texture = check(gl, gl.createTexture);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    if (params.source) {
        const source = params.source;
        const flip = "flip" in params ? params.flip : false;
        if (flip) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, params.internal, params.format, params.type, source);
        if (flip) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        params.width = source.width;
        params.height = source.height;
    } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, params.internal, params.width, params.height, 0, params.format, params.type, params.data);
    }
    setSampler(gl, params.filter, params.wrap);
    if (params.filter === gl.LINEAR_MIPMAP_LINEAR ||
        params.filter === gl.LINEAR_MIPMAP_NEAREST ||
        params.filter === gl.NEAREST_MIPMAP_LINEAR ||
        params === gl.NEAREST_MIPMAP_NEAREST)
        gl.generateMipmap(gl.TEXTURE_2D);

    return {texture, params: params};
}

export function checkFrameBufferStatus(gl: WebGL2RenderingContext) {
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status != gl.FRAMEBUFFER_COMPLETE) {
        const name = Object.keys(Object.getPrototypeOf(gl)).find(name => (gl as any)[name] === status);
        throw new Error("framebuffer incomplete " + name);
    }
}


export function setSampler(gl: WebGL2RenderingContext, filter: GLenum = gl.NEAREST, wrap: GLenum = gl.CLAMP_TO_EDGE): void {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);

    let magFilter;
    if (filter === gl.LINEAR || filter === gl.LINEAR_MIPMAP_NEAREST || filter === gl.LINEAR_MIPMAP_LINEAR)
        magFilter = gl.LINEAR;
    else
        magFilter = gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
}

export class TextureFormats {
    static RGBA8 = {
        internal: WebGL2RenderingContext.RGBA8,
        format: WebGL2RenderingContext.RGBA,
        type: WebGL2RenderingContext.UNSIGNED_BYTE
    };
    static RGBA8UI = {
        internal: WebGL2RenderingContext.RGBA8UI,
        format: WebGL2RenderingContext.RGBA_INTEGER,
        type: WebGL2RenderingContext.UNSIGNED_BYTE
    };
}

export function sourceWidth(source: TexImageSource): number {
    if (source instanceof HTMLVideoElement) return source.videoWidth;
    else if (source instanceof VideoFrame) return source.displayWidth;
    return source.width;
}

export function sourceHeight(source: TexImageSource): number {
    if (source instanceof HTMLVideoElement) return source.videoHeight;
    else if (source instanceof VideoFrame) return source.displayHeight;
    return source.height;
}