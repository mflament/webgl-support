import {RendererController} from "../../src";
import "./index.scss"
import {createShaderParserSandbox} from "./ShaderParserSandbox";
import {createQuadBufferSandbox} from "./QuadBufferSandbox";

export interface TestUniforms {
    uColor: Float32Array | [number, number, number]
    uFloat: number
}

// const parsedShader = parseShader(FS);
// console.log(parsedShader);

const canvas = document.createElement("canvas");
document.body.append(canvas);


async function start() {
    const controller = new RendererController(canvas, createQuadBufferSandbox);
    await controller.start();
}

start().catch(console.error)
