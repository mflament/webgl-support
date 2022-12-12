import {GLSLMatrixType, GLSLScalarType, GLSLType, GLSLVectorType, isGLSLType} from "./GLSLType";

export interface ParsedShader {
    source: string;
    precisions: PrecisionDeclaration[];
    structs: Record<string, StructDeclaration>;
    attributes: { in: AttributeDeclaration[], out: AttributeDeclaration[] };
    uniforms: VariableDeclaration[];
    uniformBlocks: UniformBlockDeclaration[]
    functions: FunctionDeclaration[];
}

type ParsedShaders = (ParsedShader | undefined)[];

export type QualifierId = string | PrecisionQualifier;

export type Qualifier = QualifierId | LayoutQualifiers;

export type Quantifier = { length: number };

export type LayoutQualifiers = Record<string, number | undefined>;

export type PrecisionDeclaration = {
    type: GLSLType;
    precision: PrecisionQualifier;
}

export interface VariableDeclaration {
    name: string;
    type: GLSLType | string | StructDeclaration;
    qualifiers: Qualifier[];
    quantifier?: Quantifier;
    container?: string;
}

export type UniformDeclaration = Omit<VariableDeclaration, 'qualifiers'>;

export type FlatUniformDeclaration = Omit<UniformDeclaration, 'quantifier'> & { type: GLSLType; }

export type AttributeDeclaration = VariableDeclaration & { type: GLSLScalarType | GLSLVectorType | GLSLMatrixType }

export interface FunctionDeclaration {
    name: string;
    returnType: {
        identifier: string;
        quantifier?: Quantifier;
    }
    parameters: ParameterDeclaration[];
}

export interface ParameterDeclaration {
    name: string;
    type: string | StructDeclaration;
    quantifier?: Quantifier;
    qualifiers: Qualifier[];
}

export interface StructDeclaration {
    members: VariableDeclaration[];
}

export interface UniformBlockDeclaration extends StructDeclaration {
    name: string;
    qualifiers: Qualifier[];
    identifier?: {
        name: string;
        quantifier?: Quantifier;
    }
}

export enum PrecisionQualifier {
    lowp = 'lowp',
    mediump = 'mediump',
    highp = 'highp',
}

export function isPrecisionQualifier(name: string): name is PrecisionQualifier {
    return PrecisionQualifier[name as PrecisionQualifier] !== undefined;
}


export function mergeUniforms(...shaders: ParsedShaders): VariableDeclaration[] {
    let res: VariableDeclaration[] = [];
    const names: Record<string, boolean> = {};
    for (const shader of shaders) {
        shader?.uniforms.filter(u => !names[u.name]).forEach(u => {
            res.push(u);
            names[u.name] = true;
        });
    }
    return res;
}

export function mergeUniformBlocks(...shaders: ParsedShaders) {
    const res: Pick<ParsedShader, "structs" | "uniformBlocks"> = {structs: {}, uniformBlocks: []};
    if (!Array.isArray(shaders)) shaders = [shaders];
    const names: Record<string, boolean> = {}
    shaders.forEach(s => {
        if (s) {
            Object.assign(res.structs, s.structs);
            s.uniformBlocks.filter(ub => !names[ub.name]).forEach(ub => {
                res.uniformBlocks.push(ub);
                names[ub.name] = true;
            })
            Object.assign(res.uniformBlocks, s.uniformBlocks);
        }
    });
    return res;
}

export function flattenUniforms(parsedShader: ParsedShader): FlatUniformDeclaration[] {
    const res: FlatUniformDeclaration[] = [];

    function flatten(declaration: VariableDeclaration, prefix?: string, index?: number) {
        let name = prefix ? prefix + "." + declaration.name : declaration.name;
        if (index !== undefined) name += "[" + index + "]";
        const quantifier = declaration.quantifier;
        if (quantifier) {
            for (let i = 0; i < quantifier.length; i++)
                flatten({...declaration, quantifier: undefined}, prefix, i);
        } else {
            if (typeof declaration.type === "object" || !isGLSLType(declaration.type)) {
                const struct = typeof declaration.type === "string" ? parsedShader.structs[declaration.type] : declaration.type;
                if (!struct) throw new Error("Unresolved type " + declaration.type + " for " + name);
                struct.members.forEach(member => flatten(member, name));
            } else {
                res.push({name, type: declaration.type, container: declaration.container});
            }
        }
    }

    Object.values(parsedShader.uniforms).forEach(ud => flatten(ud));
    return res;
}