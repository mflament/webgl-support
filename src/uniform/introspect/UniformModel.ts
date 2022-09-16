import {UniformBlockDefinition, UniformDefinition} from "./UniformDefinitions";

export interface IType {
    readonly bytes: number;

    isPrimitive(): this is IPrimitive;

    isArray(): this is IArray;

    isStruct(): this is IStruct;

    isBlock(): this is IBlock;
}

export interface IPrimitive extends IType {
    readonly definition: UniformDefinition
}

export interface IArray extends IType {
    readonly arraySize: number;
    readonly elementType: IType;
}

export interface IStruct extends IType {
    readonly members: IMember[];
    readonly referencedBy: IStructReference[];
}

export type IStructReference = { memberName: string, memberType: IType };

export interface IBlock extends IStruct {
    readonly blockDefinition: UniformBlockDefinition;
}

export interface IUniform<T extends IType = IType> {
    readonly type: T;
    readonly name: string;
}

export interface IMember extends IUniform<IPrimitive | IArray | IStruct> {
    readonly offset: number;
    readonly stride: number;
    readonly bytes: number;
}

export interface IProgramUniforms {
    readonly members: IUniform<IPrimitive | IArray | IStruct | IBlock>[];
}

export type MemberBindingConfig = { offset: number, stride: number }
export type StructBindingConfig<T extends {} = any> = {
    [key in keyof T]?: MemberBindingConfig
};

export const Struct = {
    collectStructs(members: IUniform[], structs?: IStruct[]): IStruct[] {
        const res = structs || [];
        members.forEach(member => {
            let type = member.type;
            if (type.isArray()) type = type.elementType;
            if(type.isStruct() && res.indexOf(type) < 0) {
                res.push(type);
                Struct.collectStructs(type.members, res);
            }
        });
        return res;
    },
    mapOffsets<T = any>(struct: IStruct, output: T): StructBindingConfig<T> {
        const res: StructBindingConfig<T> = {};
        Object.keys(output).forEach(key => {
            const member = struct.members.find(m => m.name === key);
            if (!member) {
                console.warn('Member ' + key + ' not found in ', output);
            } else {
                res[key as keyof T] = {offset: member.offset, stride: member.stride};
            }
        });
        return res;
    }
}