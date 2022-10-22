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

export function setSamplerParameters(gl: WebGL2RenderingContext, target: TextureTarget | WebGLSampler, config: Partial<SamplerConfig>): void {
    const setParam = typeof target === "object" ? gl.samplerParameteri : gl.texParameteri;

    if (config.filter?.minFilter)
        setParam(target, TextureParameter.MIN_FILTER, config.filter.minFilter);

    if (config.filter?.magFilter)
        setParam(target, TextureParameter.MAG_FILTER, config.filter.magFilter);

    if (config.wrap?.s)
        setParam(target, TextureParameter.WRAP_S, config.wrap.s);
    if (config.wrap?.t)
        setParam(target, TextureParameter.WRAP_T, config.wrap.t);
}
