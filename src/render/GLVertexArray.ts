import {BufferTarget, GLBuffer} from "../buffers";
import {FloatAttributeType, IntAttributeType} from "./BufferAttributes";
import {VertexArrayAttribute} from "./VertexArrayAttribute";

export class GLVertexArray {
    private _glVertexArray: WebGLVertexArrayObject | null;
    private _attributes: VertexArrayAttribute[] = [];

    constructor(readonly gl: WebGL2RenderingContext) {
        this._glVertexArray = gl.createVertexArray();
    }

    get glVertexArray(): WebGLVertexArrayObject {
        if (!this._glVertexArray)
            throw new Error("GLVertexArray is deleted");
        return this._glVertexArray;
    }

    get attributes(): VertexArrayAttribute[] {
        return this._attributes;
    }

    get deleted(): boolean {
        return !this._glVertexArray;
    }

    bind(): void {
        this.gl.bindVertexArray(this.glVertexArray);
    }

    unbind(): void {
        this.gl.bindVertexArray(null);
    }

    delete(): void {
        this.gl.deleteVertexArray(this._glVertexArray);
        this._glVertexArray = null;
    }

    set(index: number, attr?: VertexArrayAttribute) {
        if (!attr)
            this.disableVertexAttribArray(index)
        else if (attr.attributeType === "constant")
            this.vertexAttrib(index, attr.type, attr.value);
        else if (attr.attributeType === "int")
            this.vertexAttribIPointer(attr.buffer, index, attr.size, attr.type, attr.stride, attr.offset, attr.divisor);
        else
            this.vertexAttribPointer(attr.buffer, index, attr.size, attr.type, attr.normalized || false, attr.stride, attr.offset, attr.divisor);
    }

    vertexAttribPointer(buffer: GLBuffer, index: number, size: 1 | 2 | 3 | 4, type: FloatAttributeType, normalized: boolean, stride: number, offset: number, divisor = 0) {
        const gl = this.gl;
        buffer.bind(BufferTarget.ARRAY_BUFFER);
        gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
        if (divisor !== undefined) gl.vertexAttribDivisor(index, divisor);
        buffer.unbind(BufferTarget.ARRAY_BUFFER);
        this._attributes[index] = {attributeType: 'float', size, type, normalized, stride, offset, buffer};
        this.gl.enableVertexAttribArray(index);
    }

    vertexAttribIPointer(buffer: GLBuffer, index: number, size: 1 | 2 | 3 | 4, type: IntAttributeType, stride: number, offset: number, divisor?: number) {
        buffer.bind(BufferTarget.ARRAY_BUFFER);
        const gl = this.gl;
        gl.vertexAttribIPointer(index, size, type, stride, offset);
        if (divisor !== undefined) gl.vertexAttribDivisor(index, divisor);
        buffer.unbind(BufferTarget.ARRAY_BUFFER);
        this._attributes[index] = {attributeType: 'int', type, size, stride, offset, buffer};
        gl.enableVertexAttribArray(index);
    }

    disableVertexAttribArray(index: number) {
        this.gl.disableVertexAttribArray(index);
    }

    vertexAttrib(index: number, type: 'f' | 'i' | 'ui', value: number[]): void {
        let method = "vertexAttrib";
        if (type === "f") method += value.length + "fv";
        else if (type === "i") method += "I4iv";
        else if (type === "ui") method += "I4uiv";
        const gl = this.gl;
        method && (gl as any)[method].call(gl, index, value);
        this._attributes[index] = {attributeType: "constant", type, value};
    }


}
