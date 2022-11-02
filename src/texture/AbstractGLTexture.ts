import {TextureTarget} from '../GLEnums';
import {safeCreate} from "../utils";
import {TexImageOptions, TexImageParam, TexSubImageParam} from "./GLTexture";

export abstract class AbstractGLTexture<P extends TexImageParam, SP extends TexSubImageParam> {
    readonly glTexture: WebGLTexture;
    protected _width = 0;
    protected _height = 0;

    protected constructor(readonly gl: WebGL2RenderingContext, readonly target: TextureTarget) {
        this.glTexture = safeCreate(gl, 'createTexture');
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

    delete(): void {
        this.gl.deleteTexture(this.glTexture);
    }

    texImage(param: P, options?: TexImageOptions): void {
        options && this.setOptions(options);

        this.doTexImage(param);

        if (options?.mipmap)
            this.gl.generateMipmap(this.target);

        options && this.resetOptions(options);
    }

    texSubImage(param: SP, options?: TexImageOptions): void {
        options && this.setOptions(options);

        this.doTexSubImage(param);

        if (options?.mipmap)
            this.gl.generateMipmap(this.target);

        options && this.resetOptions(options);
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

    protected abstract doTexSubImage(param: SP): void;

}


