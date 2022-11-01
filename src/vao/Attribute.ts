import {FloatAttributeType, IntAttributeType} from "../GLEnums";
import {hasProp} from "../utils";

export interface ConstantAttribute {
    value: number[];
    type: 'f' | 'i' | 'ui';
}

export interface BufferAttribute {
    size: 1 | 2 | 3 | 4;
    type: FloatAttributeType | IntAttributeType;
    offset?: number;
    int?: boolean;
    normalized?: boolean;
}

export type Attribute = ConstantAttribute | BufferAttribute;

export interface ConfiguredConstantAttribute extends ConstantAttribute {
    index: number;
}

export interface ConfiguredBufferAttribute extends BufferAttribute {
    index: number;
    stride: number;
    offset: number;
    buffer?: WebGLBuffer;
}

export function isConstantAttribute(attr: Attribute): attr is ConstantAttribute {
    return hasProp<ConstantAttribute>(attr, "type", "string")
        && hasProp<ConstantAttribute>(attr, "value", "array");
}

export function isBufferAttribute(attr: Attribute): attr is BufferAttribute {
    return hasProp<BufferAttribute>(attr, "type", "number")
        && hasProp<BufferAttribute>(attr, "size", "number");
}

export type ConfiguredAttribute = ConfiguredConstantAttribute | ConfiguredBufferAttribute;

export interface ConfiguredAttributes {
    attributes: ConfiguredAttribute[];
    buffer?: WebGLBuffer;
}

export function attributeBytes(attr: { size: number, type: IntAttributeType | FloatAttributeType }): number {
    return componentBytes(attr.type) * attr.size;
}

export function componentBytes(type: FloatAttributeType | IntAttributeType): number {
    return ELEMENT_BYTES[type];
}

function createElementSizes(): Record<number, number> {
    const res: Record<number, number> = {};
    res[FloatAttributeType.BYTE] = 1;
    res[FloatAttributeType.UNSIGNED_BYTE] = 1;

    res[FloatAttributeType.SHORT] = 2;
    res[FloatAttributeType.UNSIGNED_SHORT] = 2;
    res[FloatAttributeType.HALF_FLOAT] = 2;

    res[FloatAttributeType.FLOAT] = 4;

    res[IntAttributeType.INT] = 4;
    res[IntAttributeType.UNSIGNED_INT] = 4;

    return res;
}

const ELEMENT_BYTES = createElementSizes();
