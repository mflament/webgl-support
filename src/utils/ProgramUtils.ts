import {createAndCompile} from "../program";

export type Uniforms = Record<string, any>;
export type UniformLocations<U extends Uniforms = Uniforms> = { [key in keyof U]: WebGLUniformLocation | null; }
export type LoadedProgram<U extends Uniforms = Uniforms> = { program: WebGLProgram, uniformLocations: UniformLocations<U> };

export function createProgram<U extends Uniforms = Uniforms>(gl: WebGL2RenderingContext, vs: string, fs: string, uniforms: U): LoadedProgram<U> {
    const program = createAndCompile(gl, vs, fs);
    const uniformLocations = getUniformLocations(gl, program, uniforms);
    return {program, uniformLocations};
}

function getUniformLocations<U extends Uniforms>(gl: WebGL2RenderingContext, program: WebGLProgram, uniforms: U): UniformLocations<U> {
    const locations: any = {};
    for (const name in uniforms) {
        const location = gl.getUniformLocation(program, name);
        locations[name] = location;
        if (location === null)
            console.info("Uniform " + name + ", not found");
    }
    return locations;
}
