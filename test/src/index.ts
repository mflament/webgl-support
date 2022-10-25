import {createQuadProgram, GLContext, GLProgram, UniformsIntrospector, generateStructsClasses} from "webgl-support";
import {FS, VS} from "./shaders";
import {UniformBlock} from "../../src";

export interface TestUniforms {
    uColor: Float32Array | [number, number, number]
    uFloat: number
}

const canvas = document.createElement("canvas");
document.body.append(canvas);
const context = new GLContext({
    canvas,
    createRenderer(glc) {
        const gl = glc.gl;
        let program: GLProgram;
        createQuadProgram(gl, {vs: VS, fs: FS}).then(p => {
            program = p;
            const ub = new UniformBlock(gl, 0, new Uint8Array(10240));
            // program.use();
            // const definitions = new UniformsIntrospector(gl).introspect(program.glProgram);
            // console.log(definitions.format());
            //
            // const models = definitions.createModel();
            // console.log(models);
            //
            // const ts = generateStructsClasses(models);
            // console.log(ts);
        });
        return {
            render() {
                if (program) {
                    program.use();
                    context.quadBuffer.render();
                }
            }
        };
    }
});
context.start();
