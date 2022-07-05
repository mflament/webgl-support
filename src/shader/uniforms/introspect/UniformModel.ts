import {UniformBlockDefinition, UniformDefinition, UniformDefinitions} from "./UniformDefinitions";

export type Type = Primitive | UniformArray | Struct;

export class Primitive {
    constructor(readonly definition: UniformDefinition) {
    }
}

export class UniformArray {
    constructor(readonly type: Type, public size: number) {
    }
}

export type StructReference = { memberName: string, memberType: Type };


export class Uniform {
    constructor(readonly name: string, readonly  type: Type){}
}

export class Member extends Uniform {
    constructor(name: string, type: Type, readonly offset: number, readonly size: number, readonly stride: number) {
        super(name, type);
    }
}

export class Struct {
    readonly members: Member[] = [];
    readonly referencedBy: StructReference[] = [];
    constructor(readonly size: number) {
    }
}

export class Block extends Struct {
    constructor(readonly blockDefinition: UniformBlockDefinition) {
        super(blockDefinition.size);
    }
}

export class ProgramUniforms {
    private constructor(readonly members: Member[]) {
    }

    * structs(): IterableIterator<Struct> {
        const visiteds: Struct[] = [];
        const stack: (Struct | ProgramUniforms)[] = [this];
        let head = stack.shift();
        while (head) {
            for (const member of head.members) {
                let memberType = member.type;
                if (memberType instanceof UniformArray)
                    memberType = memberType.type;
                if (memberType instanceof Struct) {
                    if (visiteds.indexOf(memberType) < 0) {
                        yield memberType;
                        visiteds.push(memberType);
                        stack.push(memberType);
                    }
                }
            }
            head = stack.shift();
        }
    }

    * blockUniforms(): IterableIterator<Block> {
        for (const struct of this.structs()) {
            if (isBlock(struct)) yield struct;
        }
    }

    static create(definitions: UniformDefinitions): ProgramUniforms {
        const programMembers: Member[] = [];
        for (const definition of definitions) {
            const path = definition.name.split('.');
            let struct: Struct | undefined = undefined;
            let members = programMembers;
            for (let i = 0; i < path.length - 1; i++) {
                const part = path[i]
                const memberName = stripIndex(part);
                const member = members.find(m => m.name === memberName);
                const arrayIndex = parseArrayIndex(part);
                if (!member) {
                    if (definition.blockDefinition)
                        struct = new Block(definition.blockDefinition);
                    else
                        struct = new Struct(0);
                    members.push(new Member(memberName, arrayIndex !== undefined ? new UniformArray(struct, 1) : struct));
                } else {
                    let memberType = member.type;
                    if (arrayIndex !== undefined) {
                        if (memberType instanceof UniformArray) {
                            memberType.size = arrayIndex + 1;
                            memberType = memberType.type;
                        } else
                            throw new Error("not an array" + definition.name);
                    }

                    if (memberType instanceof Struct)
                        struct = memberType;
                    else
                        throw new Error("not a struct" + definition.name);
                }
                members = struct.members;
            }

            const part = path[path.length - 1];
            const memberName = stripIndex(part);
            let type: Type = new Primitive(definition);
            if (definition.isArray())
                type = new UniformArray(type, definition.size);
            members.push({name: memberName, type});
        }

        const structs: Struct[] = [];
        for (let i = 0; i < programMembers.length; i++) {
            programMembers[i] = ProgramUniforms.collectStructs(programMembers[i], structs);
        }
        return new ProgramUniforms(programMembers);
    }

    private static collectStructs(member: Member, structs: Struct[]): Member {
        const type = member.type;
        const t = type instanceof UniformArray ? type.type : type;

        if (t instanceof Primitive)
            return member;

        if (t instanceof Struct) {
            const struct = t as Struct;
            let current = structs.find(s => isSameStruct(struct, s));
            if (!current) {
                current = struct;
                structs.push(current);
                for (let i = 0; i < struct.members.length; i++) {
                    struct.members[i] = ProgramUniforms.collectStructs(struct.members[i], structs);
                }
            }

            let res: Type;
            if (type instanceof UniformArray) res = new UniformArray(current, type.size);
            else res = current;
            current.referencedBy.push({memberName: member.name, memberType: res});
            return new Member(member.name, res);
        }

        throw new Error("Invalid type " + type);
    }

}

function isBlock(struct: Struct): struct is Block {
    return (struct as Block).blockDefinition !== undefined;
}

function isSameType(t1: Type, t2: Type): boolean {
    if (t1 instanceof Struct && t2 instanceof Struct)
        return isSameStruct(t1, t2);
    if (t1 instanceof UniformArray && t2 instanceof UniformArray)
        return t1.size === t2.size && isSameType(t1.type, t2.type);
    if (t1 instanceof Primitive && t2 instanceof Primitive)
        return isSameDefinition(t1.definition, t2.definition);
    return false;
}

function isSameStruct(s1: Struct, s2: Struct): boolean {
    if (s1.members.length !== s2.members.length)
        return false;
    for (let i = 0; i < s1.members.length; i++) {
        const m1 = s1.members[i];
        const m2 = s2.members[i];
        if (m1.name !== m2.name || !isSameType(m1.type, m2.type))
            return false;
    }
    return true;
}

function isSameDefinition(d1: UniformDefinition, d2: UniformDefinition): boolean {
    return d1.type === d2.type && d1.size === d2.size;
}

function parseArrayIndex(name: string): number | undefined {
    const i = name.lastIndexOf('[');
    if (i >= 0)
        return parseInt(name.substring(i + 1, name.length - 1));
    return undefined;
}

function stripIndex(name: string): string {
    const i = name.lastIndexOf('[');
    if (i >= 0)
        return name.substring(0, i);
    return name;
}

