import {BufferAttribute} from "./BufferAttributes";
import {GLBuffer} from "../buffers";

export interface ContstantAttribute {
    attributeType: 'constant';
    type: 'f' | 'i' | 'ui';
    value: number[];
}

export type ConnectedBufferAttribute = BufferAttribute & { buffer: GLBuffer };
export type VertexArrayAttribute = ConnectedBufferAttribute | ContstantAttribute;

export function isConstantBufferAttribute(attr: VertexArrayAttribute): attr is ContstantAttribute {
    return attr.attributeType === "constant";
}