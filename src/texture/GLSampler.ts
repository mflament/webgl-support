import {TextureParameter} from "./GLTextureEnums";
import {SamplerConfig} from "./SamplerConfig";
import {check} from "../utils";

export class GLSampler {
    private _glSampler?: WebGLSampler;

    constructor(readonly gl: WebGL2RenderingContext) {
        this._glSampler = check(gl.createSampler(), "Sampler");
    }

    get glSampler(): WebGLSampler {
        if (!this._glSampler)
            throw new Error("Sampler is deleted");
        return this._glSampler;
    }

    bind(unit: GLenum):void {
        this.gl.bindSampler(unit, this.glSampler);
    }

    unbind(unit: GLenum):void {
        this.gl.bindSampler(unit, null);
    }

    delete() {
        if (this._glSampler) {
            this.gl.deleteSampler(this._glSampler);
            this._glSampler = undefined;
        }
    }

    setSamplerConfig(config: Partial<SamplerConfig>): void {
        const {glSampler, gl} = this;
        if (config.filter?.minFilter)
            gl.samplerParameteri(glSampler, TextureParameter.MIN_FILTER, config.filter.minFilter);

        if (config.filter?.magFilter)
            gl.samplerParameteri(glSampler, TextureParameter.MAG_FILTER, config.filter.magFilter);

        if (typeof config.wrap === "number") {
            gl.samplerParameteri(glSampler, TextureParameter.WRAP_S, config.wrap);
            gl.samplerParameteri(glSampler, TextureParameter.WRAP_T, config.wrap);
            gl.samplerParameteri(glSampler, TextureParameter.WRAP_R, config.wrap);
        } else {
            if (config.wrap?.s !== undefined)
                gl.samplerParameteri(glSampler, TextureParameter.WRAP_S, config.wrap.s);
            if (config.wrap?.t !== undefined)
                gl.samplerParameteri(glSampler, TextureParameter.WRAP_T, config.wrap.t);
            if (config.wrap?.r !== undefined)
                gl.samplerParameteri(glSampler, TextureParameter.WRAP_R, config.wrap.r);
        }
    }
}