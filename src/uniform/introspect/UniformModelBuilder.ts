import {UniformBlockDefinition, UniformDefinition, UniformDefinitions} from "./UniformDefinitions";
import {
    IArray,
    IBlock,
    IPrimitive,
    IProgramUniforms,
    IStruct,
    IType,
    IUniform,
    IStructReference
} from "./UniformModel";

class Uniform implements IUniform<IPrimitive | IArray | IStruct | IBlock> {
    constructor(readonly name: string, public type: Type) {
    }
}

class Member extends Uniform {
    stride = 0; // in bytes

    /**
     * offset in bytes, relative ot container Struct
     */
    constructor(name: string, type: Type, readonly offset = 0) {
        super(name, type);
        this.offset = offset;
        if (type instanceof Primitive) {
            this.stride = type.definition.totalBytes();
        }
    }

    get bytes(): number {
        return this.type.bytes;
    }

}

type Type = Primitive | UniformArray | Struct;

abstract class AbstractType implements IType {
    abstract get bytes(): number;

    isSameType(t2: Type): boolean {
        if (this instanceof Struct && t2 instanceof Struct)
            return isSameMembers(this.members, t2.members);
        if (this instanceof UniformArray && t2 instanceof UniformArray)
            return this.arraySize === t2.arraySize && this.elementType.isSameType(t2.elementType);
        if (this instanceof Primitive && t2 instanceof Primitive)
            return AbstractType.isSameDefinition(this.definition, t2.definition);
        return false;
    }

    private static isSameDefinition(d1: UniformDefinition, d2: UniformDefinition): boolean {
        return d1.type === d2.type && d1.size === d2.size;
    }

    isPrimitive(): this is IPrimitive {
        return false;
    }

    isArray(): this is IArray {
        return false;
    }

    isStruct(): this is IStruct {
        return false;
    }

    isBlock(): this is IBlock {
        return false;
    }
}

class Primitive extends AbstractType implements IPrimitive {
    constructor(readonly definition: UniformDefinition) {
        super();
    }

    isPrimitive(): this is IPrimitive {
        return true;
    }

    get bytes(): number {
        return this.definition.elementBytes();
    }
}

class UniformArray extends AbstractType implements IArray {
    constructor(readonly elementType: Type, public arraySize = elementType instanceof Primitive ? elementType.bytes : 0) {
        super();
    }

    isArray(): this is IArray {
        return true;
    }

    get bytes(): number {
        return this.arraySize * this.elementType.bytes;
    }
}

class Struct extends AbstractType implements IStruct {
    readonly referencedBy: IStructReference[] = [];
    readonly members: Member[] = [];

    protected _bytes = 0;
    protected _startOffset?: number;
    protected _lastMember?: Member;

    get bytes(): number {
        return this._bytes;
    }

    set bytes(b: number) {
        this._bytes = b;
    }

    isStruct(): this is IStruct {
        return true;
    }

    push(name: string, definition: UniformDefinition): void {
        let offset = 0;
        if (this._startOffset === undefined) this._startOffset = definition.offset;
        else offset = definition.offset - this._startOffset;
        const parsedName = new ParsedName(name);
        let member = this.members.find(m => m.name === parsedName.memberName);
        if (!member) {
            this.completeMember(offset);
            let type: Type = parsedName.propertyName ? new Struct() : new Primitive(definition);
            if (parsedName.arrayIndex !== undefined)
                type = new UniformArray(type);
            member = new Member(parsedName.memberName, type, offset);
            this.members.push(member);
            this._lastMember = member;
        }
        let type = member.type;
        if (type instanceof UniformArray && parsedName.arrayIndex !== undefined) {
            if (parsedName.arrayIndex === 0) {
                type = type.elementType;
            } else {
                if (parsedName.arrayIndex === 1) this.completeStruct(offset);
                type.arraySize = parsedName.arrayIndex + 1;
            }
        }
        if (type instanceof Struct && parsedName.propertyName) {
            type.push(parsedName.propertyName, definition);
        }
    }

    completeMember(offset: number): void {
        const lm = this._lastMember;
        if (lm) {
            this.completeStruct(offset);
            lm.stride = offset - lm.offset;
            this._lastMember = undefined;
        }
    }

    completeStruct(offset: number): void {
        const lm = this._lastMember;
        if (!lm) return;
        let type = lm.type;
        if (type.isArray())
            type = type.elementType;
        if (type.isStruct()) {
            type._bytes = type._bytes = offset - lm.offset
            if (type === lm.type)
                this._lastMember = undefined;
        }
    }
}

class Block extends Struct implements IBlock {
    constructor(readonly blockDefinition: UniformBlockDefinition) {
        super();
    }

    isBlock(): this is IBlock {
        return true;
    }

    get name(): string {
        return this.blockDefinition.name;
    }

    get bytes(): number {
        return this.blockDefinition.size;
    }

    completeBlock(): void {
        this._bytes = this.blockDefinition.size;
        this.completeStruct(this._bytes);
    }
}

class ParsedName {
    readonly memberName: string;
    readonly propertyName?: string;
    readonly arrayIndex?: number;

    constructor(name: string) {
        let i = name.indexOf('.');
        let memberName = name;
        if (i > 0) {
            memberName = name.substring(0, i);
            this.propertyName = name.substring(i + 1, name.length);
        }
        i = memberName.indexOf('[');
        let arrayIndex = undefined;
        if (i > 0) {
            arrayIndex = parseInt(memberName.substring(i + 1, memberName.length - 1));
            memberName = memberName.substring(0, i);
        }
        this.arrayIndex = arrayIndex;
        this.memberName = memberName;
    }
}

function isSameMembers(a: Member[], b: Member[]): boolean {
    if (a.length !== b.length)
        return false;

    for (let i = 0; i < a.length; i++) {
        const m1 = a[i];
        const m2 = b[i];
        if (m1.name !== m2.name || !m1.type.isSameType(m2.type))
            return false;
    }
    return true;
}

export function createUniformsModel(definitons: UniformDefinitions): IProgramUniforms {
    return ProgramUniforms.create(definitons);
}

class ProgramUniforms implements IProgramUniforms {

    static create(definitions: UniformDefinitions): ProgramUniforms {
        const res = new ProgramUniforms();
        for (const definition of definitions) {
            res.push(definition);
        }
        res.completeBlock();
        res.groupStructs();
        return res;
    }

    readonly members: (Uniform)[] = [];

    private lastBlock?: Block;

    private push(definition: UniformDefinition): void {
        const parsedName = new ParsedName(definition.name);
        let member = this.members.find(m => m.name === parsedName.memberName);
        if (!member) {
            this.completeBlock();

            let type: Type;
            if (parsedName.propertyName) {
                if (definition.blockDefinition)
                    type = this.lastBlock = new Block(definition.blockDefinition);
                else
                    type = new Struct();
            } else
                type = new Primitive(definition);

            if (parsedName.arrayIndex !== undefined)
                type = new UniformArray(type);

            member = new Uniform(parsedName.memberName, type);
            this.members.push(member);
        }

        let type = member.type;
        if (type instanceof UniformArray && parsedName.arrayIndex === 0) {
            type = type.elementType;
        }

        if (type instanceof Struct && parsedName.propertyName) {
            type.push(parsedName.propertyName, definition);
        }
    }

    private completeBlock(): void {
        if (this.lastBlock) {
            this.lastBlock.completeBlock();
            this.lastBlock = undefined;
        }
    }

    private groupStructs(): void {
        const structs: Struct[] = [];
        const groupMembers = (member: Uniform) => {
            const type = member.type;
            const t = type instanceof UniformArray ? type.elementType : type;
            if (t instanceof Primitive)
                return;

            if (t instanceof Struct) {
                const struct = t as Struct;
                let current = structs.find(s => struct.isSameType(s));
                if (!current) {
                    current = struct;
                    structs.push(current);
                    for (let i = 0; i < struct.members.length; i++) {
                        groupMembers(struct.members[i]);
                    }
                }

                let res: Type;
                if (type instanceof UniformArray)
                    res = new UniformArray(current, type.arraySize);
                else res = current;
                current.referencedBy.push({memberName: member.name, memberType: res});
                member.type = res;
            }
        }

        this.members.forEach(groupMembers);
    }
}