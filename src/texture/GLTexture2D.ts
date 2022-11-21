import {TextureTarget} from "./GLTextureEnums";
import {AbstractGLTexture, TexImageParam, TexSubImageParam} from "./AbstractGLTexture";
import {hasProp} from "../utils";


type Tex2DWithSize = { width: number; height: number; }
type Tex2DWithData = Tex2DWithSize & { srcData: ArrayBufferView; srcOffset?: number; }
type Tex2DWithPBOOffset = Tex2DWithSize & { pboOffset: number; }
type Tex2DWithSource = { source: TexImageSource; }
type Tex2DParams = Tex2DWithSize | Tex2DWithData | Tex2DWithPBOOffset | Tex2DWithSource;

export type TexImage2DParam = TexImageParam & Tex2DParams;

export type TexSubImage2DParam = TexSubImageParam & {
    level?: number;
    xoffset?: number;
    yoffset?: number;
} & (Tex2DWithData | Tex2DWithPBOOffset | Tex2DWithSource)

export class GLTexture2D extends AbstractGLTexture<TexImage2DParam, TexSubImage2DParam> {

    constructor(gl: WebGL2RenderingContext) {
        super(gl, TextureTarget.TEXTURE_2D);
    }

    protected doTexImage(param: TexImage2DParam): void {
        const {gl, target} = this;
        const {internalFormat, format, type} = param;
        let width, height;
        if (isTexWithSource(param)) {
            width = sourceWidth(param.source);
            height = sourceHeight(param.source);
            gl.texImage2D(target, 0, internalFormat, format, type, param.source);
        } else if (isTexWithSize(param)) {
            width = param.width;
            height = param.height;
            if (isTexWithData(param))
                gl.texImage2D(target, 0, internalFormat, width, height, 0, format, type, param.srcData, param.srcOffset || 0);
            else if (isTexWithPBOOffset(param))
                gl.texImage2D(target, 0, internalFormat, width, height, 0, format, type, param.pboOffset);
            else
                gl.texImage2D(target, 0, internalFormat, width, height, 0, format, type, null);
        } else
            throw new Error("invalid texImage2D param");

        this._width = width;
        this._height = height;
    }

    protected doTexSubImage(param: TexSubImage2DParam): void {
        const {gl, target} = this;
        const sp = {level: 0, xoffset: 0, yoffset: 0, srcOffset: 0, width: this._width, height: this._height, ...param};
        GLTexture2D.texSubImage(gl, target, sp);
    }

    static texSubImage(gl: WebGL2RenderingContext, target: GLenum, sp: Required<TexSubImage2DParam>): void {
        if (isTexWithSource(sp)) {
            gl.texSubImage2D(target, sp.level, sp.xoffset, sp.yoffset, sp.format, sp.type, sp.source);
        } else if (isTexWithSize(sp)) {
            const width = sp.width;
            const height = sp.height;
            if (isTexWithData(sp))
                gl.texSubImage2D(target, sp.level, sp.xoffset, sp.yoffset, width, height, sp.format, sp.type, sp.srcData, sp.srcOffset || 0);
            else if (isTexWithPBOOffset(sp))
                gl.texSubImage2D(target, sp.level, sp.xoffset, sp.yoffset, width, height, sp.format, sp.type, sp.pboOffset);
        } else
            throw new Error("invalid texSubImage2D param");
    }
}

export function isTexWithSize(param: any): param is Tex2DWithSize {
    return hasProp<Tex2DWithSize>(param, "width", "number") && hasProp<Tex2DWithSize>(param, "height", "number");
}

function isTexWithData(param: Tex2DParams): param is Tex2DWithData {
    return isTexWithSize(param) && hasProp<Tex2DWithData>(param, "srcData", "object");
}

function isTexWithPBOOffset(param: Tex2DParams): param is Tex2DWithPBOOffset {
    return isTexWithSize(param) && hasProp<Tex2DWithPBOOffset>(param, "pboOffset", "number");
}

function isTexWithSource(param: Tex2DParams): param is Tex2DWithSource {
    return hasProp<Tex2DWithSource>(param, "source", "object");
}

function sourceWidth(source: TexImageSource): number {
    if (source instanceof HTMLVideoElement) return source.videoWidth;
    return source.width;
}

function sourceHeight(source: TexImageSource): number {
    if (source instanceof HTMLVideoElement) return source.videoHeight;
    return source.height;
}