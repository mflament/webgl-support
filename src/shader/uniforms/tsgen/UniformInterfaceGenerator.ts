import {Block, Primitive, Struct, StructReference, Type, UniformArray, ProgramUniforms} from "../introspect/UniformModel";
import {UniformType} from "../../../GLEnums";

export class UniformInterfaceGenerator {
    constructor(readonly createName: (struct: Struct) => string = createDefaultName) {
    }

    generate(interfaceName: string, models: ProgramUniforms): string {
        const blocks: string[] = [];
        blocks.push(`export interface ${interfaceName} {`);
        for (const name in models.members) {
            const type = models.members[name];
            if (type instanceof Block) continue;
            blocks.push(`    ${name}: ${this.generateType(type)}`)
        }
        blocks.push("}");

        this.generateStructs(models, blocks);

        return blocks.join('\n');
    }

    private generateStructs(models: ProgramUniforms, blocks: string[]): string {
        for (const struct of models.structs()) {
            const name = this.createName(struct);
            blocks.push(`export interface ${name} {`);
            blocks.push(this.generateMembers(struct.members));
            blocks.push(`}`);
        }
        return blocks.join("\n");
    }

    private generateMembers(members: Record<string, Type>): string {
        return Object.keys(members).map(name => {
            const type = this.generateType(members[name]);
            return type && `    ${name}: ${type};`
        }).filter(s => !!s).join("\n");
    }

    private generateType(type: Type): string | undefined {
        let t = type;
        if (t instanceof UniformArray)
            t = t.type;
        let res;
        if (t instanceof Struct) {
            res = this.createName(t);
        } else if (t instanceof Primitive) {
            res = getTSType(t.definition.type);
        } else
            return;

        if (type instanceof UniformArray)
            res += '[]';

        return res;
    }

}

function createDefaultName(struct: Struct) {
    let name;
    if (struct instanceof Block) name = struct.blockDefinition.name;
    else name = struct.referencedBy.sort(compareStructReferences)[0].memberName;
    if (name.startsWith("u"))
        name = name.substring(1);
    name = name.charAt(0).toUpperCase() + name.substring(1);
    if (struct instanceof Block && !name.endsWith("Uniform"))
        name += "Uniform";
    return name;
}

function compareStructReferences(r1: StructReference, r2: StructReference): number {
    return r1.memberType instanceof UniformArray ? 1 : r2.memberType instanceof UniformArray ? -1 : 0;
}

function getTSType(glType: UniformType): string {
    switch (glType) {
        case UniformType.FLOAT:
        case UniformType.INT:
        case UniformType.UNSIGNED_INT:
            return 'number';
        case UniformType.BOOL:
            return 'boolean';
        case UniformType.FLOAT_VEC2:
            return floatVector(2);
        case UniformType.FLOAT_VEC3:
            return floatVector(3);
        case UniformType.FLOAT_VEC4:
            return floatVector(4);
        case UniformType.FLOAT_MAT2:
            return floatVector(2 * 2);
        case UniformType.FLOAT_MAT3:
            return floatVector(3 * 3);
        case UniformType.FLOAT_MAT4:
            return floatVector(4 * 4);
        case UniformType.FLOAT_MAT2x3:
            return floatVector(2 * 3);
        case UniformType.FLOAT_MAT2x4:
            return floatVector(2 * 4);
        case UniformType.FLOAT_MAT3x2:
            return floatVector(3 * 2);
        case UniformType.FLOAT_MAT3x4:
            return floatVector(3 * 4);
        case UniformType.FLOAT_MAT4x2:
            return floatVector(4 * 2);
        case UniformType.FLOAT_MAT4x3:
            return floatVector(4 * 3);
        case UniformType.INT_VEC2:
        case UniformType.BOOL_VEC2:
            return intVector(2);
        case UniformType.INT_VEC3:
        case UniformType.BOOL_VEC3:
            return intVector(3);
        case UniformType.INT_VEC4:
        case UniformType.BOOL_VEC4:
            return intVector(4);
        case UniformType.UNSIGNED_INT_VEC2:
            return uintVector(2);
        case UniformType.UNSIGNED_INT_VEC3:
            return uintVector(3);
        case UniformType.UNSIGNED_INT_VEC4:
            return uintVector(4);
        case UniformType.SAMPLER2D:
        case UniformType.SAMPLER_CUBE:
        case UniformType.SAMPLER_3D:
        case UniformType.SAMPLER_2D_SHADOW:
        case UniformType.SAMPLER_2D_ARRAY:
        case UniformType.SAMPLER_2D_ARRAY_SHADOW:
        case UniformType.SAMPLER_CUBE_SHADOW:
        case UniformType.INT_SAMPLER_2D:
        case UniformType.INT_SAMPLER_3D:
        case UniformType.INT_SAMPLER_CUBE:
        case UniformType.INT_SAMPLER_2D_ARRAY:
        case UniformType.UNSIGNED_INT_SAMPLER_2D:
        case UniformType.UNSIGNED_INT_SAMPLER_3D:
        case UniformType.UNSIGNED_INT_SAMPLER_CUBE:
        case UniformType.UNSIGNED_INT_SAMPLER_2D_ARRAY:
            return 'number';
        default:
            throw new Error("Invalid gl uniform type " + glType);
    }
}

function floatVector(size: number): string {
    return vector("Float32Array", size);
}

function intVector(size: number): string {
    return vector("Int32Array", size);
}

function uintVector(size: number): string {
    return vector("UInt32Array", size);
}

function vector(type: string, size: number): string {
    let s = type + " | ["
    for (let i = 0; i < size - 1; i++) {
        s += "number, "
    }
    s += "number]";
    return s;
}

export type vec2 = Float32Array | [number, number];
export type vec3 = Float32Array | [number, number, number];
export type vec4 = Float32Array | [number, number, number, number];

export type ivec2 = Int32Array | [number, number];
export type ivec3 = Int32Array | [number, number, number];
export type ivec4 = Int32Array | [number, number, number, number];

export type uivec2 = Uint32Array | [number, number];
export type uivec3 = Uint32Array | [number, number, number];
export type uivec4 = Uint32Array | [number, number, number, number];
