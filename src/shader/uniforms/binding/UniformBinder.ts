import {ProgramUniformDefinition} from "../introspect/UniformDefinitions";
import {UniformType} from "../../../GLEnums";
import {Block, Primitive, Struct, UniformArray, ProgramUniforms} from "../introspect/UniformModel";
import {GLContext} from "../../../GLContext";

const uniformGetter = () => {
    throw new Error("Unsupported");
}

type MemberWriter<T = any> = (dv: DataView, offset: number, instance: T) => number;

class BoundBlock<T = any> {
    private readonly glBuffer: WebGLBuffer;
    private readonly buffer: Uint8Array;
    private readonly memberWriters: MemberWriter<T>[];

    constructor(readonly context: GLContext, readonly block: Block) {
        const gl = context.gl;
        const glBuffer = gl.createBuffer();
        if (!glBuffer)
            throw new Error("Error creating gl buffer");
        this.glBuffer = glBuffer;
        this.buffer = new Uint8Array(block.blockDefinition.size);
        gl.bindBuffer(gl.UNIFORM_BUFFER, this.glBuffer);
        gl.bufferData(gl.UNIFORM_BUFFER, this.buffer.length, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, block.blockDefinition.binding, this.glBuffer);

        this.memberWriters = BoundBlock.createMemberWriters(0, block);
    }

    write(b: T): void {
        this.writeStruct(0, this.block, b);
    }

    private writeStruct(offset: number, struct: Struct, instance: Record<string, any>) {
        for (const name in struct.members) {
            const member = struct.members[name];
            const memberType = member.type;
            const value = instance[name];
            if (value !== undefined) {
                this.writeValue(offset, member, value);
            }
            offset += member.size;
        }
    }

    private writeValue(offset: number, member: Primitive | UniformArray | Struct, value: any): number {
        // const elemenType = member instanceof
    }

    private static createMemberWriters(offset: number, struct: Struct) : MemberWriter[] {
        for (let i = 0; i < struct.members.length; i++) {
            const member = struct.members[i];
            let type = member.type;
            if (type instanceof UniformArray)
        }
        return [];
    }
}

export class UniformBinder {

    constructor(readonly gl: WebGL2RenderingContext) {
    }

    bind<T = any>(models: ProgramUniforms): T {
        const res = {};
        for (const name in models.members) {
            const type = models.members[name];
            if (type instanceof Block) {

            } else {
                const elementType = type instanceof UniformArray ? type.type : type;
                if (elementType instanceof Primitive && elementType.definition.isProgramUniformDefinition()) {
                    const setter = this.createSetter(elementType.definition);
                    Object.defineProperty(res, name, {get: uniformGetter, set: setter});
                } else
                    throw new Error("Type " + elementType + " is not yet supported");
            }
        }
        return res as T;
    }

    private createSetter(definition: ProgramUniformDefinition) {
        const gl = this.gl;
        const location = definition.location;
        let methodName = "uniform" + getUniformMethodType(definition.type);
        if (definition.isVector() || definition.isArray() || definition.isMatrix())
            methodName += "v";

        let method = gl[methodName as keyof WebGL2RenderingContext] as (location: WebGLUniformLocation, ...args: any) => void;
        method = method.bind(gl);
        if (!method) throw new Error("Invalid uniform setter " + methodName);

        if (definition.isMatrix())
            return (data: Float32List) => method(location, false, data);
        return (data: any) => method(location, data);
    }

}

function getUniformMethodType(type: UniformType): string {
    switch (type) {
        case UniformType.FLOAT:
            return "1f";
        case UniformType.FLOAT_VEC2:
            return "2f";
        case UniformType.FLOAT_VEC3:
            return "3f";
        case UniformType.FLOAT_VEC4:
            return "4f";
        case UniformType.INT:
        case UniformType.BOOL:
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
            return "1i";
        case UniformType.INT_VEC2:
        case UniformType.BOOL_VEC2:
            return "2i";
        case UniformType.INT_VEC3:
        case UniformType.BOOL_VEC3:
            return "3i";
        case UniformType.INT_VEC4:
        case UniformType.BOOL_VEC4:
            return "4i";
        case UniformType.UNSIGNED_INT:
            return "1ui";
        case UniformType.UNSIGNED_INT_VEC2:
            return "2ui";
        case UniformType.UNSIGNED_INT_VEC3:
            return "3ui";
        case UniformType.UNSIGNED_INT_VEC4:
            return "4ui";
        case UniformType.FLOAT_MAT2:
            return "Matrix2f";
        case UniformType.FLOAT_MAT3:
            return "Matrix3f";
        case UniformType.FLOAT_MAT4:
            return "Matrix4f";
        case UniformType.FLOAT_MAT2x3:
            return "Matrix2x3f";
        case UniformType.FLOAT_MAT2x4:
            return "Matrix2x4f";
        case UniformType.FLOAT_MAT3x2:
            return "Matrix3x2f";
        case UniformType.FLOAT_MAT3x4:
            return "Matrix3x4f";
        case UniformType.FLOAT_MAT4x2:
            return "Matrix4x2f";
        case UniformType.FLOAT_MAT4x3:
            return "Matrix4x3f";
        default:
            throw new Error("Invalid type " + type);
    }

}
