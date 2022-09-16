import {UniformType} from "../../GLEnums";
import {IProgramUniforms, IStruct, IStructReference, IType, IUniform, Struct} from "../introspect/UniformModel";

export function generateStructsClasses(programUniforms: IProgramUniforms, createName?: (struct: IStruct) => string | undefined): string {
    return new UniformStructBindingGenerator(createName).generate(programUniforms);
}

class UniformStructBindingGenerator {
    constructor(readonly createName?: (struct: IStruct) => string | undefined) {
    }

    generate(programUniforms: IProgramUniforms): string {
        const lines: string[] = [];
        Struct.collectStructs(programUniforms.members).forEach(struct => this.generateStruct(struct, lines));
        return lines.join('\n');
    }

    private generateStruct(struct: IStruct, lines: string[]): void {
        const name = this.safeCreateName(struct);
        lines.push(`export class ${name} {`,'');
        lines.push(`    static readonly BYTES = ${struct.bytes};`, '')
        struct.members
            .map(m => `    static readonly ${upperSnakeCase(m.name)} = { offset: ${m.offset}, stride: ${m.stride}};`)
            .forEach(s => lines.push(s));
        lines.push('');
        this.generateMembers(struct.members, lines);
        lines.push(`}`, '')
    }

    private safeCreateName(struct: IStruct): string {
        let name = this.createName ? this.createName(struct) : undefined;
        if (!name) name = createDefaultName(struct);
        return name
    }

    private generateMembers(members: IUniform[], lines: string[]): void {
        members.map(member => {
            const type = this.generateType(member.type);
            return type && `    ${member.name} = ${type};`
        }).forEach(s => s && lines.push(s));
    }

    private generateType(type: IType): string | undefined {
        let t = type;

        if (t.isArray()) {
            const elementType = this.generateType(t.elementType);
            if (!elementType)
                return undefined;
            const types: string[] = [];
            for (let i = 0; i < t.arraySize; i++)
                types.push(elementType);
            return `[${types.join(", ")}]`
        }

        if (t.isStruct())
            return `new ${this.safeCreateName(t)}()`;

        if (t.isPrimitive())
            return getTSType(t.definition.type);

        return undefined;
    }

}

function createDefaultName(struct: IStruct) {
    let name;
    if (struct.isBlock()) name = struct.blockDefinition.name;
    else name = struct.referencedBy.sort(compareStructReferences)[0].memberName;
    if (name.startsWith("u"))
        name = name.substring(1);
    name = name.charAt(0).toUpperCase() + name.substring(1);
    if (struct.isBlock() && !name.endsWith("Uniform"))
        name += "Uniform";
    return name;
}

function compareStructReferences(r1: IStructReference, r2: IStructReference): number {
    return r1.memberType.isArray() ? 1 : r2.memberType.isArray() ? -1 : 0;
}

function getTSType(glType: UniformType): string {
    function newFloatArray(size: number) {
        return `new Float32Array(${size})`;
    }

    switch (glType) {
        case UniformType.FLOAT:
        case UniformType.INT:
        case UniformType.UNSIGNED_INT:
            return '0';
        case UniformType.BOOL:
            return 'false';
        case UniformType.FLOAT_VEC2:
        case UniformType.INT_VEC2:
        case UniformType.BOOL_VEC2:
        case UniformType.UNSIGNED_INT_VEC2:
            return 'vec2.create()';
        case UniformType.FLOAT_VEC3:
        case UniformType.INT_VEC3:
        case UniformType.BOOL_VEC3:
        case UniformType.UNSIGNED_INT_VEC3:
            return 'vec3.create()';
        case UniformType.FLOAT_VEC4:
        case UniformType.INT_VEC4:
        case UniformType.BOOL_VEC4:
        case UniformType.UNSIGNED_INT_VEC4:
            return 'vec4.create()';
        case UniformType.FLOAT_MAT2:
            return 'mat2.create()';
        case UniformType.FLOAT_MAT3:
            return 'mat3.create()';
        case UniformType.FLOAT_MAT4:
            return 'mat4.create()';
        case UniformType.FLOAT_MAT2x3:
            return newFloatArray(2 * 3);
        case UniformType.FLOAT_MAT2x4:
            return newFloatArray(2 * 4);
        case UniformType.FLOAT_MAT3x2:
            return newFloatArray(3 * 2);
        case UniformType.FLOAT_MAT3x4:
            return newFloatArray(3 * 4);
        case UniformType.FLOAT_MAT4x2:
            return newFloatArray(4 * 2);
        case UniformType.FLOAT_MAT4x3:
            return newFloatArray(4 * 3);
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


function upperSnakeCase(name: string): string {
    let res = "";
    for (let i = 0; i < name.length; i++) {
        let c = name.charAt(i);
        if (isUpperCase(c)) res += "_";
        res += c.toUpperCase();
    }
    return res;
}

function isUpperCase(s: string): boolean {
    return s.toUpperCase() === s;
}