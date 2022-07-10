import {UniformBlockDefinition, UniformDefinition, UniformDefinitions} from "./UniformDefinitions";

export class Uniform {
    constructor(readonly name: string, public type: Type) {
    }
}

export class Member extends Uniform {
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

export type Type = Primitive | UniformArray | Struct;

abstract class AbstractType {
    abstract get bytes(): number;

    isSameType(t2: Type): boolean {
        if (this instanceof Struct && t2 instanceof Struct)
            return isSameMembers(this.members, t2.members);
        if (this instanceof UniformArray && t2 instanceof UniformArray)
            return this.arraySize === t2.arraySize && this.type.isSameType(t2.type);
        if (this instanceof Primitive && t2 instanceof Primitive)
            return AbstractType.isSameDefinition(this.definition, t2.definition);
        return false;
    }

    private static isSameDefinition(d1: UniformDefinition, d2: UniformDefinition): boolean {
        return d1.type === d2.type && d1.size === d2.size;
    }

}

export class Primitive extends AbstractType {
    constructor(readonly definition: UniformDefinition) {
        super();
    }

    get bytes(): number {
        return this.definition.elementBytes();
    }
}

export class UniformArray extends AbstractType {
    constructor(readonly type: Type, public arraySize = type instanceof Primitive ? type.bytes : 0) {
        super();
    }

    get bytes(): number {
        return this.arraySize * this.type.bytes;
    }
}

export class Struct extends AbstractType {
    readonly referencedBy: StructReference[] = [];
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

    push(name: string, definition: UniformDefinition): void {
        let offset = 0;
        if (this._startOffset === undefined) this._startOffset = definition.offset;
        else offset = definition.offset - this._startOffset;
        const parsedName = new ParsedName(name);
        let member = this.members.find(m => m.name === parsedName.memberName);
        if (!member) {
            this.completeStruct(offset);
            let type: Type = parsedName.propertyName ? new Struct() : new Primitive(definition);
            if (parsedName.arrayIndex !== undefined)
                type = new UniformArray(type);
            member = new Member(parsedName.memberName, type, offset);
            this.members.push(member);
            this._lastMember = member;
        }
        let type = member.type;
        if (type instanceof UniformArray && parsedName.arrayIndex !== undefined) {
            if (parsedName.arrayIndex === 0)
                type = type.type;
            else {
                type.arraySize = parsedName.arrayIndex + 1;
                this.completeStruct(offset);
            }
        }
        if (type instanceof Struct && parsedName.propertyName)
            type.push(parsedName.propertyName, definition);
    }

    completeStruct(offset: number): void {
        if (this._lastMember) {
            this._lastMember.stride = offset - this._lastMember.offset;
            let type = this._lastMember.type;
            if (type instanceof UniformArray) type = type.type;
            if (type instanceof Struct)
                type._bytes = this._lastMember.stride;
            this._lastMember = undefined;
        }
    }
}

export class Block extends Struct {
    constructor(readonly blockDefinition: UniformBlockDefinition) {
        super();
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

export type StructReference = { memberName: string, memberType: Type };

export class ProgramUniforms {
    readonly members: Uniform[] = [];
    private lastBlock?: Block;

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
            type = type.type;
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

    static create(definitions: UniformDefinitions): ProgramUniforms {
        const res = new ProgramUniforms();
        for (const definition of definitions) {
            res.push(definition);
        }
        res.completeBlock();
        res.groupStructs();
        return res;
    }

    private groupStructs(): void {
        const structs: Struct[] = [];
        const groupMembers = (member: Uniform) => {
            const type = member.type;
            const t = type instanceof UniformArray ? type.type : type;
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

function isBlock(struct: Struct): struct is Block {
    return (struct as Block).blockDefinition !== undefined;
}
