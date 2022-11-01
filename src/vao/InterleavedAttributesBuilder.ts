import {FloatAttributeType, IntAttributeType} from "../GLEnums";
import {GLArrayBuffer} from "../buffers";
import {
    attributeBytes,
    BufferAttribute,
    ConfiguredAttribute,
    ConfiguredAttributes,
    isBufferAttribute
} from "./Attribute";

export function interleaved(buffer: WebGLBuffer | GLArrayBuffer) : InterleavedAttributesBuilder {
    return new InterleavedAttributesBuilder(buffer);
}

class InterleavedAttributesBuilder {

    private readonly _attributes: ConfiguredAttribute[] = [];

    readonly buffer: WebGLBuffer;

    private _offset = 0;

    constructor(buffer: WebGLBuffer | GLArrayBuffer) {
        this.buffer = buffer instanceof GLArrayBuffer ? buffer.glBuffer : buffer;
    }

    float(type = FloatAttributeType.FLOAT, offset?: number, normalized = false): this {
        return this.attribute({size: 1, type, normalized, offset});
    }

    vec2(type = FloatAttributeType.FLOAT, offset?: number, normalized = false): this {
        return this.attribute({size: 2, type, normalized, offset});
    }

    vec3(type = FloatAttributeType.FLOAT, offset?: number, normalized = false): this {
        return this.attribute({size: 3, type, normalized, offset});
    }

    vec4(type = FloatAttributeType.FLOAT, offset?: number, normalized = false): this {
        return this.attribute({size: 4, type, normalized, offset});
    }

    int(type = IntAttributeType.INT, offset?: number): this {
        return this.attribute({size: 1, type, offset, int: true});
    }

    ivec2(type = IntAttributeType.INT, offset?: number): this {
        return this.attribute({size: 2, type, offset, int: true});
    }

    ivec3(type = IntAttributeType.INT, offset?: number): this {
        return this.attribute({size: 3, type, offset, int: true});
    }

    ivec4(type = IntAttributeType.INT, offset?: number): this {
        return this.attribute({size: 4, type, offset, int: true});
    }

    constant(type: 'f' | 'i' | 'ui', value: number[]): this {
        this._attributes.push({type, value, index: this._attributes.length});
        return this;
    }

    attribute(attr: BufferAttribute): this {
        if (typeof attr.offset === "number") {
            if (attr.offset < this._offset)
                throw new Error("Invalid offset " + attr.offset + ", current stride : " + this._offset);
            this._offset = attr.offset;
        }
        this._attributes.push({
            ...attr,
            index: this._attributes.length,
            offset: this._offset,
            stride: 0
        });
        this._offset += attributeBytes(attr);
        return this;
    }

    build(): ConfiguredAttributes {
        for (const attr of this._attributes) {
            if (isBufferAttribute(attr))
                attr.stride = this._offset;
        }
        return {attributes: this._attributes, buffer: this.buffer};
    }

}
