import {TextureTarget} from "./GLTextureEnums";
import {AbstractGLTexture, TexImageParam, TexStorageParam, TexSubImageParam} from "./AbstractGLTexture";
import {hasProp} from "../utils";

type Tex3DWithSize = { width: number, height: number, depth: number; }
type Tex3DWithData = Tex3DWithSize & { srcData: ArrayBufferView; srcOffset?: number; }
type Tex3DParams = Tex3DWithSize | Tex3DWithData;

export type TexImage3DParam = TexImageParam & Tex3DParams;
export type TexSubImage3DParam = TexSubImageParam & {
    level?: number;
    xoffset?: number;
    yoffset?: number;
    zoffset?: number;
    width?: number;
    height?: number;
    depth?: number;
    srcData: ArrayBufferView;
    srcOffset?: number;
};

export interface Tex3DStorageParams extends TexStorageParam {
    depth: number;
}

export abstract class AbstractGLTexture3D extends AbstractGLTexture<TexImage3DParam, TexSubImage3DParam, Tex3DStorageParams> {
    private _depth = 0;

    protected constructor(gl: WebGL2RenderingContext, target: TextureTarget) {
        super(gl, target);
    }

    get depth(): number {
        return this._depth;
    }

    texStorage(params: Tex3DStorageParams): void {
        this.gl.texStorage3D(this.target, params.levels, params.internalFormat, params.width, params.height, params.depth);
        this._width = params.width;
        this._height = params.height;
        this._depth = params.depth;
    }

    protected doTexImage(param: TexImage3DParam): void {
        const {gl, target} = this;
        const {internalFormat, format, type, width, height, depth} = param;

        if (this.isTex3DWithData(param)) {
            gl.texImage3D(target, 0, internalFormat, width, height, depth, 0, format, type, param.srcData, param.srcOffset || 0);
        } else if (this.isTex3DWithSize(param)) {
            gl.texImage3D(target, 0, internalFormat, width, height, depth, 0, format, type, null);
        } else
            throw new Error("invalid TexImage3DParam texImage param");

        this._width = width;
        this._height = height;
        this._depth = depth;
    }

    protected doTexSubImage(param: TexSubImage3DParam): void {
        const {gl, target} = this;
        const sp = {
            level: 0,
            xoffset: 0,
            yoffset: 0,
            zoffset: 0,
            width: this._width,
            height: this._height,
            depth: this._depth,
            ...param
        };
        if (this.isTex3DWithData(sp))
            gl.texSubImage3D(target, sp.level, sp.xoffset, sp.yoffset, sp.zoffset, sp.width, sp.height, sp.depth, sp.format, sp.type, sp.srcData, sp.srcOffset || 0);
        else
            throw new Error("invalid TexSubImage3DParam param");
    }

    private isTex3DWithData(param: Tex3DParams): param is Tex3DWithData {
        return this.isTex3DWithSize(param) && hasProp<Tex3DWithData>(param, "srcData", "object");
    }

    private isTex3DWithSize(param: Tex3DParams): param is Tex3DWithSize {
        return hasProp<Tex3DWithSize>(param, "width", "number")
            && hasProp<Tex3DWithSize>(param, "height", "number")
            && hasProp<Tex3DWithSize>(param, "depth", "number");
    }

}
