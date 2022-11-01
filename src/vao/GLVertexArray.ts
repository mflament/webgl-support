import {safeCreate} from "../utils";
import {ConfiguredAttributes, ConfiguredConstantAttribute, isConstantAttribute} from "./Attribute";

export class GLVertexArray {
    readonly glVertexArray: WebGLVertexArrayObject
    private _attributes: ConfiguredAttributes = {attributes: []};

    constructor(readonly gl: WebGL2RenderingContext) {
        this.glVertexArray = safeCreate(gl, 'createVertexArray');
    }

    get attributes(): ConfiguredAttributes {
        return this._attributes;
    }

    set attributes(attrs: ConfiguredAttributes) {
        this.bind();
        const gl = this.gl;
        for (let i = 0; i < this._attributes.attributes.length; i++)
            gl.disableVertexAttribArray(i);

        this._attributes = attrs;
        if (attrs.buffer)
            gl.bindBuffer(gl.ARRAY_BUFFER, attrs.buffer);

        for (let index = 0; index < attrs.attributes.length; index++) {
            const attr = attrs.attributes[index];
            if (isConstantAttribute(attr)) {
                this.setConstantAttribute(index, attr);
            } else {
                if (attr.buffer)
                    gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);

                if (attr.int)
                    gl.vertexAttribIPointer(index, attr.size, attr.type, attr.stride, attr.offset);
                else
                    gl.vertexAttribPointer(index, attr.size, attr.type, !!attr.normalized, attr.stride, attr.offset);
                gl.enableVertexAttribArray(index);
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        this.unbind();
    }

    private setConstantAttribute(index: number, attr: ConfiguredConstantAttribute) {
        const value = attr.value;
        let method = "vertexAttrib";
        if (attr.type === "f") method += value.length + "fv";
        else if (attr.type === "i") method += "I4iv";
        else if (attr.type === "ui") method += "I4uiv";
        const gl = this.gl;
        method && (gl as any)[method].call(gl, index, value);
    }

    bind(): void {
        this.gl.bindVertexArray(this.glVertexArray);
    }

    unbind(): void {
        this.gl.bindVertexArray(null);
    }

    delete(): void {
        this.gl.deleteVertexArray(this.glVertexArray);
    }

}
