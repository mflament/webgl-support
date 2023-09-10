import {InternalFormat, TextureComponentType, TextureFormat, TextureParameter, TextureTarget} from './GLTextureEnums';
import {SamplerConfig} from "./SamplerConfig";
import {GLTexture} from "./GLTexture";

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
    samplerConfig?: SamplerConfig;
}

export interface TexStorageParam {
    internalFormat: InternalFormat;
    width: number;
    height: number;
    levels: number;
}

export abstract class AbstractGLTexture<P extends TexImageParam, SIP extends TexSubImageParam, TSP extends TexStorageParam = TexStorageParam> implements GLTexture {

    private _glTexture: WebGLTexture | null;

    protected _width = 0;
    protected _height = 0;

    protected constructor(readonly gl: WebGL2RenderingContext, readonly target: TextureTarget) {
        this._glTexture = gl.createTexture();
    }

    get glTexture(): WebGLTexture {
        if (!this._glTexture)
            throw new Error("GLTexture is deleted");
        return this._glTexture;
    }

    get deleted(): boolean {
        return !this._glTexture;
    }

    delete(): void {
        if (this._glTexture) {
            this.gl.deleteTexture(this._glTexture);
            this._glTexture = null;
        }
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    bind() {
        this.gl.bindTexture(this.target, this.glTexture);
    }

    unbind() {
        this.gl.bindTexture(this.target, null);
    }

    texImage(param: P, options?: TexImageOptions): void {
        options && this.setOptions(options);

        this.doTexImage(param);

        if (options?.mipmap)
            this.gl.generateMipmap(this.target);

        options && this.resetOptions(options);
    }

    texSubImage(param: SIP, options?: TexImageOptions): void {
        options && this.setOptions(options);

        this.doTexSubImage(param);

        if (options?.mipmap)
            this.gl.generateMipmap(this.target);

        options && this.resetOptions(options);
    }

    setSampler(config: SamplerConfig) {
        const {gl, target} = this;
        if (config.filter?.minFilter)
            gl.texParameteri(target, TextureParameter.MIN_FILTER, config.filter.minFilter);

        if (config.filter?.magFilter)
            gl.texParameteri(target, TextureParameter.MAG_FILTER, config.filter.magFilter);

        if (typeof config.wrap === "number") {
            gl.texParameteri(target, TextureParameter.WRAP_S, config.wrap);
            gl.texParameteri(target, TextureParameter.WRAP_T, config.wrap);
            gl.texParameteri(target, TextureParameter.WRAP_R, config.wrap);
        } else {
            if (config.wrap?.s)
                gl.texParameteri(target, TextureParameter.WRAP_S, config.wrap.s);
            if (config.wrap?.t)
                gl.texParameteri(target, TextureParameter.WRAP_T, config.wrap.t);
            if (config.wrap?.r !== undefined)
                gl.texParameteri(target, TextureParameter.WRAP_R, config.wrap.r);
        }
    }

    generateMipmap(): void {
        const gl = this.gl;
        gl.bindTexture(this.target, this.glTexture);
        gl.generateMipmap(this.target);
        gl.bindTexture(this.target, null);
    }

    private setOptions(options: TexImageOptions) {
        const gl = this.gl;
        if (options?.bind) this.bind();
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, options.noColorSpaceConversion ? gl.NONE : gl.BROWSER_DEFAULT_WEBGL);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, options.unpackAlignment || 4);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !!options.flipY);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !!options.premultiplyAlpha);
        if (options.samplerConfig)
            this.setSampler(options.samplerConfig);
    }

    private resetOptions(options: TexImageOptions) {
        const gl = this.gl;
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, gl.BROWSER_DEFAULT_WEBGL);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        if (options?.bind) this.unbind();
    }

    protected abstract doTexImage(param: P): void;

    protected abstract doTexSubImage(param: SIP): void;

    abstract texStorage(params: TSP): void;

}


