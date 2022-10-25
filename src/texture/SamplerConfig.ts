import {TextureMagFilter, TextureMinFilter, TextureParameter, TextureTarget, TextureWrappingMode} from "../GLEnums";

export interface SamplerConfig {
    filter: {
        minFilter: TextureMinFilter;
        magFilter: TextureMagFilter
    }
    wrap: {
        s: TextureWrappingMode;
        t: TextureWrappingMode;
        w?: TextureWrappingMode
    }
}

export function setSamplerConfig(gl: WebGL2RenderingContext, target: WebGLSampler, config: Partial<SamplerConfig>): void {
    if (config.filter?.minFilter)
        gl.samplerParameteri(target, TextureParameter.MIN_FILTER, config.filter.minFilter);

    if (config.filter?.magFilter)
        gl.samplerParameteri(target, TextureParameter.MAG_FILTER, config.filter.magFilter);

    if (config.wrap?.s)
        gl.samplerParameteri(target, TextureParameter.WRAP_S, config.wrap.s);
    if (config.wrap?.t)
        gl.samplerParameteri(target, TextureParameter.WRAP_T, config.wrap.t);
}

export function setTexureSamplerConfig(gl: WebGL2RenderingContext, target: TextureTarget, config: Partial<SamplerConfig>): void {
    if (config.filter?.minFilter)
        gl.texParameteri(target, TextureParameter.MIN_FILTER, config.filter.minFilter);

    if (config.filter?.magFilter)
        gl.texParameteri(target, TextureParameter.MAG_FILTER, config.filter.magFilter);

    if (config.wrap?.s)
        gl.texParameteri(target, TextureParameter.WRAP_S, config.wrap.s);
    if (config.wrap?.t)
        gl.texParameteri(target, TextureParameter.WRAP_T, config.wrap.t);
}
