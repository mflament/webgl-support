export enum FloatAttributeType {
    BYTE = WebGL2RenderingContext.BYTE,
    UNSIGNED_BYTE = WebGL2RenderingContext.UNSIGNED_BYTE,
    SHORT = WebGL2RenderingContext.SHORT,
    UNSIGNED_SHORT = WebGL2RenderingContext.UNSIGNED_SHORT,
    FLOAT = WebGL2RenderingContext.FLOAT,
    HALF_FLOAT = WebGL2RenderingContext.HALF_FLOAT
}

export enum IntAttributeType {
    BYTE = WebGL2RenderingContext.BYTE,
    UNSIGNED_BYTE = WebGL2RenderingContext.UNSIGNED_BYTE,
    SHORT = WebGL2RenderingContext.SHORT,
    UNSIGNED_SHORT = WebGL2RenderingContext.UNSIGNED_SHORT,
    INT = WebGL2RenderingContext.INT,
    UNSIGNED_INT = WebGL2RenderingContext.UNSIGNED_INT
}

export type BufferAttributeSize = 1 | 2 | 3 | 4;

interface BaseBufferAttribute {
    attributeType?: 'float' | 'int';
    size: BufferAttributeSize;
    type: FloatAttributeType | IntAttributeType;
    divisor?: number;
}

export interface FloatBufferAttribute extends BaseBufferAttribute {
    attributeType?: "float";
    type: FloatAttributeType;
    normalized?: boolean;
}

export interface IntBufferAttribute extends BaseBufferAttribute {
    attributeType: 'int'
    type: IntAttributeType;
}

export function isFloatBufferAttribute<A extends PartialBufferAttribute>(attr: A): attr is A & FloatBufferAttribute {
    return attr.attributeType === "float";
}

export function isIntBufferAttribute<A extends PartialBufferAttribute>(attr: A): attr is A & IntBufferAttribute {
    return attr.attributeType === "int";
}

export type PartialBufferAttribute = FloatBufferAttribute | IntBufferAttribute;

export type BufferAttribute = PartialBufferAttribute & {
    offset: number;
    stride: number;
}

export type InterleavedBufferAttributes = BufferAttribute[] & { readonly stride: number };

export function interleaved(...pattributes: PartialBufferAttribute[]): InterleavedBufferAttributes {
    const stride = pattributes.reduce((total, a) => total + attributeBytes(a), 0);
    const attributes = createAttributes(pattributes, stride,true);
    (attributes as any).stride = stride;
    return attributes as InterleavedBufferAttributes;
}

export function separate(vertexCount: number, ...pattributes: PartialBufferAttribute[]): BufferAttribute[] {
    return createAttributes(pattributes, 0, false, vertexCount);
}

function createAttributes(pattributes: PartialBufferAttribute[], stride: number, interleaved: boolean, vertexCount = 0): BufferAttribute[] {
    let offset = 0;
    const attributes: BufferAttribute[] = [];
    for (const attr of pattributes) {
        let ba: BufferAttribute;
        const bytes = attributeBytes(attr);
        if (attr.attributeType === "int")
            ba = {...attr, offset, stride};
        else
            ba = {
                ...attr,
                attributeType: "float",
                normalized: attr.normalized || false,
                offset, stride
            };
        offset = interleaved ?  offset + bytes : offset + attributeBytes(attr) * vertexCount;
        attributes.push(ba);
    }
    return attributes;
}

export function attributeBytes(attr: PartialBufferAttribute): number {
    return scalarBytes(attr.type) * attr.size;
}

export function scalarBytes(type: GLenum): number {
    switch (type) {
        case FloatAttributeType.BYTE:
        case FloatAttributeType.UNSIGNED_BYTE:
            return 1;
        case FloatAttributeType.SHORT:
        case FloatAttributeType.UNSIGNED_SHORT:
            return 2;
        case FloatAttributeType.FLOAT:
        case FloatAttributeType.HALF_FLOAT:
        case IntAttributeType.INT:
        case IntAttributeType.UNSIGNED_INT:
            return 4;
        default:
            throw new Error("Invalid buffer attribute type " + type);
    }
}
