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
        if (options?.bind) this.bind();
        options && this.setOptions(options, true);

        this.doTexImage(param);

        if (options?.mipmap)
            this.gl.generateMipmap(this.target);

        options && this.setOptions(options, false);
        if (options?.bind) this.unbind();
    }

    texSubImage(param: SP, options?: TexImageOptions): void {
        options && this.setOptions(options, true);

        this.doTexSubImage(param);

        if (options?.mipmap)
            this.gl.generateMipmap(this.target);

        options && this.setOptions(options, false);
    }

    generateMipmap(): void {
        const gl  = this.gl;
        gl.bindTexture(this.target, this.glTexture);
        gl.generateMipmap(this.target);
        gl.bindTexture(this.target, null);
    }

    protected setOptions(options: TexImageOptions, on: boolean) {
        const gl = this.gl;
        if (options.noColorSpaceConversion) gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, on ? gl.NONE : gl.BROWSER_DEFAULT_WEBGL);
        const upa = options.unpackAlignment || 4;
        if (upa !== 4) gl.pixelStorei(gl.UNPACK_ALIGNMENT, on ? upa : 4);
    }

    protected abstract doTexImage(param: P): void;

    protected abstract doTexSubImage(param: SP): void;

}


