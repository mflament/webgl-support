import {SamplerConfig} from "./SamplerConfig";
import {TextureTarget} from "./GLTextureEnums";

export interface GLTexture {

    readonly glTexture: WebGLTexture;

    readonly target: TextureTarget;

    delete(): void;

    readonly width: number;
    readonly height: number;

    bind(): void;

    unbind(): void;

    setSampler(config: SamplerConfig): void;

    generateMipmap(): void;
}
