import {TextureMagFilter, TextureMinFilter, TextureParameter, TextureTarget, TextureWrappingMode} from "../GLEnums";

export interface SamplerConfig {
    filter: {
        minFilter: TextureMinFilter;
        magFilter: TextureMagFilter
    };
    wrap: {
        s: TextureWrappingMode;
        t: TextureWrappingMode;
        r?: TextureWrappingMode
    } | TextureWrappingMode;
}

export function setSamplerConfig(gl: WebGL2RenderingContext, target: WebGLSampler, config: Partial<SamplerConfig>): void {
    if (config.filter?.minFilter)
        gl.samplerParameteri(target, TextureParameter.MIN_FILTER, config.filter.minFilter);

    if (config.filter?.magFilter)
        gl.samplerParameteri(target, TextureParameter.MAG_FILTER, config.filter.magFilter);

    if (typeof config.wrap === "number") {
        gl.samplerParameteri(target, TextureParameter.WRAP_S, config.wrap);
        gl.samplerParameteri(target, TextureParameter.WRAP_T, config.wrap);
        gl.samplerParameteri(target, TextureParameter.WRAP_R, config.wrap);
    } else {
        if (config.wrap?.s !== undefined)
            gl.samplerParameteri(target, TextureParameter.WRAP_S, config.wrap.s);
        if (config.wrap?.t !== undefined)
            gl.samplerParameteri(target, TextureParameter.WRAP_T, config.wrap.t);
        if (config.wrap?.r !== undefined)
            gl.samplerParameteri(target, TextureParameter.WRAP_R, config.wrap.r);
    }
}

export function setTexureSamplerConfig(gl: WebGL2RenderingContext, target: TextureTarget, config: Partial<SamplerConfig>): void {
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
