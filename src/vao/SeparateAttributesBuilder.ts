import {GLArrayBuffer} from "../buffers";
import {FloatAttributeType, IntAttributeType} from "../GLEnums";
import {attributeBytes, BufferAttribute, ConfiguredAttribute, ConfiguredAttributes} from "./Attribute";

export function separate(): SeparateAttributesBuilder {
    return new SeparateAttributesBuilder();
}

export class SeparateAttributesBuilder {

    private readonly _attributes: ConfiguredAttribute[] = [];

    float(buffer: WebGLBuffer | GLArrayBuffer, type = FloatAttributeType.FLOAT, offset?: number, normalized = false): this {
        return this.attribute({buffer, size: 1, type, offset, normalized});
    }

    vec2(buffer: WebGLBuffer | GLArrayBuffer, type = FloatAttributeType.FLOAT, offset?: number, normalized = false): this {
        return this.attribute({buffer, size: 2, type, offset, normalized});
    }

    vec3(buffer: WebGLBuffer | GLArrayBuffer, type = FloatAttributeType.FLOAT, offset?: number, normalized = false): this {
        return this.attribute({buffer, size: 3, type, offset, normalized});
    }

    vec4(buffer: WebGLBuffer | GLArrayBuffer, type = FloatAttributeType.FLOAT, offset?: number, normalized = false): this {
        return this.attribute({buffer, size: 4, type, offset, normalized});
    }

    int(buffer: WebGLBuffer | GLArrayBuffer, type = IntAttributeType.INT, offset?: number): this {
        return this.attribute({buffer, size: 1, type, offset, int: true});
    }

    ivec2(buffer: WebGLBuffer | GLArrayBuffer, type = IntAttributeType.INT, offset?: number): this {
        return this.attribute({buffer, size: 2, type, offset, int: true});
    }

    ivec3(buffer: WebGLBuffer | GLArrayBuffer, type = IntAttributeType.INT, offset?: number): this {
        return this.attribute({buffer, size: 3, type, offset, int: true});
    }

    ivec4(buffer: WebGLBuffer | GLArrayBuffer, type = IntAttributeType.INT, offset?: number): this {
        return this.attribute({buffer, size: 4, type, offset, int: true});
    }

    constant(type: 'f' | 'i' | 'ui', value: number[]): this {
        this._attributes.push({type, value, index: this._attributes.length});
        return this;
    }

    attribute(attr: BufferAttribute & { buffer: WebGLBuffer | GLArrayBuffer }): this {
        this._attributes.push({
            ...attr,
            buffer: attr.buffer instanceof GLArrayBuffer ? attr.buffer.glBuffer : attr.buffer,
            index: this._attributes.length,
            offset: attr.offset || 0,
            stride: attributeBytes(attr)
        });
        return this;
    }

    build(): ConfiguredAttributes {
        return {attributes: this._attributes};
    }

}