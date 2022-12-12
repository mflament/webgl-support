import {glEnumName} from "../../utils";
import {GLMatrixType, GLScalarType, GLVectorType} from "../GLType";

export type GLAttributeType = GLScalarType | GLVectorType | GLMatrixType;

export class AttributeDefinition {
    constructor(readonly name: string,
                readonly location: GLint,
                readonly type: GLenum,
                readonly size: GLint) {
    }

    toString(): string {
        return `${this.name} : location: ${this.location}, type: ${glEnumName(this.type)}, size: ${this.size}`
    }
}

