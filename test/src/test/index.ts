import {CompilationResult, GLContext} from "../../../src";
import "./index.scss"
import {createFramebufferSandbox} from "./FramebufferSandbox";
import {createAnotherSandbox} from "./AnotherSandbox";

export interface TestUniforms {
    uColor: Float32Array | [number, number, number]
    uFloat: number
}

// const parsedShader = parseShader(FS);
// console.log(parsedShader);

const canvas = document.createElement("canvas");
document.body.append(canvas);


const context = new GLContext({canvas});
createFramebufferSandbox(context)
// createTransformFeedbackSandbox(context)
// createAnotherSandbox(context)
    .then(renderer => context.renderer = renderer).catch(e => console.error(e instanceof CompilationResult ? e.formatLogs() : e));
