interface UniformInfo {
    name: string;
    type: number;
    size: number;
    blockIndex: number;
    offset: number;
    arrayStride: number;
    matrixStride: number;
    isRowMajor: boolean;
}

export function dumpUniforms(gl: WebGL2RenderingContext, program: WebGLProgram): string {
    const activeUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    if (activeUniforms == 0) return "";

    const uniformIndices: number[] = [];
    for (let i = 0; i < activeUniforms; i++) uniformIndices.push(i);
    const types = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_TYPE);
    const sizes = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_SIZE);
    const blockIndices = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_BLOCK_INDEX);
    const offsets = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_OFFSET);
    const arrayStrides = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_ARRAY_STRIDE);
    const matrixStrides = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_MATRIX_STRIDE);
    const roMajors = gl.getActiveUniforms(program, uniformIndices, gl.UNIFORM_IS_ROW_MAJOR);

    const unfiormsInfos: UniformInfo[] = [];
    for (let i = 0; i < activeUniforms; i++) {
        const au = gl.getActiveUniform(program, i);
        if (au) {
            unfiormsInfos.push({
                name: au.name,
                type: types[i],
                size: sizes[i],
                blockIndex: blockIndices[i],
                offset: offsets[i],
                arrayStride: arrayStrides[i],
                matrixStride: matrixStrides[i],
                isRowMajor: roMajors[i]
            });
        }
    }

    const blocks: string[] = [];
    unfiormsInfos.filter(ui => ui.blockIndex < 0).map(ui => formatUniform(ui)).forEach(s => blocks.push(s));

    const uniformBlocks = gl.getProgramParameter(program, gl.ACTIVE_UNIFORM_BLOCKS);
    for (let i = 0; i < uniformBlocks; i++) {
        const blockName = gl.getActiveUniformBlockName(program, i);
        const binding = gl.getActiveUniformBlockParameter(program, i, gl.UNIFORM_BLOCK_BINDING);
        const dataSize = gl.getActiveUniformBlockParameter(program, i, gl.UNIFORM_BLOCK_DATA_SIZE);
        blocks.push(`${blockName} (binding: ${binding}, size: ${dataSize})`);

        unfiormsInfos.filter(ui => ui.blockIndex === i)
            .sort((ui1, ui2) => ui1.offset - ui2.offset)
            .map(ui => '    ' + formatUniform(ui))
            .forEach(s => blocks.push(s));
    }

    return blocks.join("\n");
}

function formatUniform(ui: UniformInfo): string {
    return `${ui.name} : ${ui.size} x ${uniformTypeName(ui.type)} offset: ${ui.offset} arrayStride: ${ui.arrayStride} matrixStride: ${ui.matrixStride} isRowMajor: ${ui.isRowMajor}`;
}

function uniformTypeName(t: number): string {
    const gl = WebGL2RenderingContext;
    switch (t) {
        case gl.FLOAT:
            return "FLOAT";
        case gl.FLOAT_VEC2:
            return "FLOAT_VEC2";
        case gl.FLOAT_VEC3:
            return "FLOAT_VEC3";
        case gl.FLOAT_VEC4:
            return "FLOAT_VEC4";
        case gl.INT:
            return "INT";
        case gl.INT_VEC2:
            return "INT_VEC2";
        case gl.INT_VEC3:
            return "INT_VEC3";
        case gl.INT_VEC4:
            return "INT_VEC4";
        case gl.BOOL:
            return "BOOL";
        case gl.BOOL_VEC2:
            return "BOOL_VEC2";
        case gl.BOOL_VEC3:
            return "BOOL_VEC3";
        case gl.BOOL_VEC4:
            return "BOOL_VEC4";
        case gl.FLOAT_MAT2:
            return "FLOAT_MAT2";
        case gl.FLOAT_MAT3:
            return "FLOAT_MAT3";
        case gl.FLOAT_MAT4:
            return "FLOAT_MAT4";
        case gl.SAMPLER_2D:
            return "SAMPLER_2D";
        case gl.SAMPLER_CUBE:
            return "SAMPLER_CUBE";
        case gl.UNSIGNED_INT:
            return "UNSIGNED_INT";
        case gl.UNSIGNED_INT_VEC2:
            return "UNSIGNED_INT_VEC2";
        case gl.UNSIGNED_INT_VEC3:
            return "UNSIGNED_INT_VEC3";
        case gl.UNSIGNED_INT_VEC4:
            return "UNSIGNED_INT_VEC4";
        case gl.FLOAT_MAT2x3:
            return "FLOAT_MAT2x3";
        case gl.FLOAT_MAT2x4:
            return "FLOAT_MAT2x4";
        case gl.FLOAT_MAT3x2:
            return "FLOAT_MAT3x2";
        case gl.FLOAT_MAT3x4:
            return "FLOAT_MAT3x4";
        case gl.FLOAT_MAT4x2:
            return "FLOAT_MAT4x2";
        case gl.FLOAT_MAT4x3:
            return "FLOAT_MAT4x3";
        case gl.SAMPLER_3D:
            return "SAMPLER_3D";
        case gl.SAMPLER_2D_SHADOW:
            return "SAMPLER_2D_SHADOW";
        case gl.SAMPLER_2D_ARRAY:
            return "SAMPLER_2D_ARRAY";
        case gl.SAMPLER_2D_ARRAY_SHADOW:
            return "SAMPLER_2D_ARRAY_SHADOW";
        case gl.SAMPLER_CUBE_SHADOW:
            return "SAMPLER_CUBE_SHADOW";
        case gl.INT_SAMPLER_2D:
            return "INT_SAMPLER_2D";
        case gl.INT_SAMPLER_3D:
            return "INT_SAMPLER_3D";
        case gl.INT_SAMPLER_CUBE:
            return "INT_SAMPLER_CUBE";
        case gl.INT_SAMPLER_2D_ARRAY:
            return "INT_SAMPLER_2D_ARRAY";
        case gl.UNSIGNED_INT_SAMPLER_2D:
            return "UNSIGNED_INT_SAMPLER_2D";
        case gl.UNSIGNED_INT_SAMPLER_3D:
            return "UNSIGNED_INT_SAMPLER_3D";
        case gl.UNSIGNED_INT_SAMPLER_CUBE:
            return "UNSIGNED_INT_SAMPLER_CUBE";
        case gl.UNSIGNED_INT_SAMPLER_2D_ARRAY:
            return "UNSIGNED_INT_SAMPLER_2D_ARRAY";
        default:
            return "Unknown type " + t;
    }
}