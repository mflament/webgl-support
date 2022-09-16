import {IMember, IStruct} from "../introspect/UniformModel";

export class StructBinding<T extends {} = any> {
    private readonly members: Record<keyof T, IMember>;

    constructor(readonly struct: IStruct, readonly gl: WebGL2RenderingContext) {
        this.members = struct.members.reduce((prev, curr) => {
            prev[curr.name as keyof T] = curr;
            return prev;
        }, {} as Record<keyof T, IMember>);
    }

    get(name: keyof T): IMember | undefined {
        return this.members[name];
    }

}
