import {GLProgram} from "../GLProgram";
import {mergeUniformBlocks, ParsedShader, UniformBlockDeclaration, VariableDeclaration} from "./ParsedShader";
import {parseShader} from "./ShaderParser";
import {getAttributesCount, getAttributeSize, isGLSLMatrixType, isGLSLType} from "./GLSLType";
import {hasProp} from "../../utils";

export type Span = { offset: number, size: number };

export type ArraySpan = { arraySize: number, arrayStride: number };

export type WithMembers = { members: { [name: string]: Span } };

export type BlockSpan = WithMembers & { blockSize: number };
export type BlockArraySpan = BlockSpan & ArraySpan;

export function isArraySpan(o: any): o is ArraySpan {
    return hasProp<ArraySpan>(o, "arraySize", "number")
        && hasProp<ArraySpan>(o, "arrayStride", "number");
}

export function isWithMembers(o: Span): o is Span & WithMembers {
    return hasProp<WithMembers>(o, "members", "object");
}

export function analyzeUniformBlocks(program: GLProgram, ...parsedShaders: ParsedShader[]): Record<string, BlockSpan | BlockArraySpan> {
    if (!program.glProgram)
        return {};
    const {gl, glProgram} = program;
    if (parsedShaders.length === 0) {
        const shaders = gl.getAttachedShaders(glProgram);
        if (!shaders) throw new Error("No attached shaders to prorgam");
        parsedShaders = shaders.map(shader => gl.getShaderSource(shader))
            .filter(s => !!s).map(s => parseShader(s!));
    }

    const types = mergeUniformBlocks(...parsedShaders);
    function analyzeMembers(path: string[], memberDeclarations: VariableDeclaration[]): Record<string, Span> {
        const members: Record<string, Span> = {};
        for (const memberDeclaration of memberDeclarations) {
            const arraySize = memberDeclaration.quantifier;
            let memberName = memberDeclaration.name;
            if (arraySize) memberName += "[0]";
            const qualifiedName = [...path, memberName].join('.');

            const uniformIndices = gl.getUniformIndices(glProgram, [qualifiedName]);
            if (!uniformIndices || uniformIndices[0] === gl.INVALID_INDEX)
                throw new Error("Error retriving uniforms index for " + qualifiedName);
            const uniformIndex = uniformIndices[0];

            const offset = program.getUniformParameter(uniformIndex, "UNIFORM_OFFSET");
            const size = program.getUniformParameter(uniformIndex, "UNIFORM_SIZE");

            const nestedMemberDeclarations = typeof memberDeclaration.type === "object"
                ? memberDeclaration.type.members
                : types.structs[memberDeclaration.type]?.members;

            let nestedMembers: Record<string, Span> | undefined = undefined;
            if (typeof memberDeclaration.type === "object")
                nestedMembers = analyzeMembers([...path, memberName], nestedMemberDeclarations);
            let memberSize;
            if (arraySize)
                memberSize = program.getUniformParameter(uniformIndex, "UNIFORM_ARRAY_STRIDE");
            else {
                if (nestedMembers) {
                    memberSize = Object.values(nestedMembers).reduce((total, m) => total + m.size, 0);
                } else if (typeof memberDeclaration.type === "string" && isGLSLType(memberDeclaration.type)) {
                    const glslType = memberDeclaration.type;
                    if (isGLSLMatrixType(memberDeclaration.type))
                        memberSize = program.getUniformParameter(uniformIndex, "UNIFORM_MATRIX_STRIDE") * getAttributesCount(glslType);
                    else
                        memberSize = getAttributeSize(glslType) * 4;
                } else
                    throw new Error("Unhandled uniform type " + memberDeclaration.type);
            }

            const length = memberSize * size;
            let member: Span | Span & ArraySpan;
            if (arraySize) {
                const arrayStride = program.getUniformParameter(uniformIndex, "UNIFORM_ARRAY_STRIDE");
                member = {offset, size: length, arraySize: arraySize.length, arrayStride};
            } else {
                member = {offset, size: length};
            }

            members[memberDeclaration.name] = member;
        }
        return members;
    }

    function analyzeUniformBlock(block: UniformBlockDeclaration): BlockSpan | BlockArraySpan {
        const blockName = block.name;

        const arraySize = block.identifier?.quantifier;
        const blockIndex = program.getBlockIndex(arraySize ? blockName + '[0]' : blockName);
        if (blockIndex === undefined) throw new Error("No block index for block " + blockName);

        const blockSize = gl.getActiveUniformBlockParameter(glProgram, blockIndex, gl.UNIFORM_BLOCK_DATA_SIZE);
        const members = analyzeMembers(block.identifier ? [block.name] : [], block.members);
        const res = {blockSize, members};
        if (arraySize) {
            const ba = res as BlockArraySpan;
            ba.arraySize = arraySize.length;
            ba.arrayStride = blockSize;
        }
        return res;
    }

    return Object.entries(types.uniformBlocks).reduce((res, [name, bd]) => {
        res[name] = analyzeUniformBlock(bd);
        return res;
    }, {} as Record<string, BlockSpan | BlockArraySpan>);
}

