import {TextureMagFilter, TextureMinFilter, TextureWrappingMode} from "./GLTextureEnums";

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
