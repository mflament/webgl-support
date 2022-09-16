import {IntPointerType, FloatPointerType} from '../GLEnums';

export class VertexArrayBuilder {
    private attributeCount = 0;
    private offset = 0;
    private pointerAttributes: (FloatPointerAttribute | IntPointerAttribute)[] = [];

    constructor(readonly gl: WebGL2RenderingContext) {
    }

    vertexAttribPointer(size: number, type: FloatPointerType = FloatPointerType.FLOAT, normalized = false, offset = this.offset): this {
        const attribute = new FloatPointerAttribute(this.attributeCount++, size, type, normalized, offset);
        this.pointerAttributes.push(attribute);
        this.offset += attribute.attributeBytes;
        return this;
    }

    vertexAttribIPointer(size: number, type: IntPointerType = IntPointerType.BYTE, offset = this.offset): this {
        const attribute = new IntPointerAttribute(this.attributeCount++, size, type, offset);
        this.pointerAttributes.push(attribute);
        this.offset += attribute.attributeBytes;
        return this;
    }

    vertexAttrib1f(x: GLfloat): this {
        this.gl.vertexAttrib1f(this.attributeCount++, x);
        return this;
    }

    vertexAttrib1fv(values: Float32List): this {
        this.gl.vertexAttrib1fv(this.attributeCount++, values);
        return this;
    }

    vertexAttrib2f(x: GLfloat, y: GLfloat): this {
        this.gl.vertexAttrib2f(this.attributeCount++, x, y);
        return this;
    }

    vertexAttrib2fv(values: Float32List): this {
        this.gl.vertexAttrib2fv(this.attributeCount++, values);
        return this;
    }

    vertexAttrib3f(x: GLfloat, y: GLfloat, z: GLfloat): this {
        this.gl.vertexAttrib3f(this.attributeCount++, x, y, z);
        return this;
    }

    vertexAttrib3fv(values: Float32List): this {
        this.gl.vertexAttrib3fv(this.attributeCount++, values);
        return this;
    }

    vertexAttrib4f(x: GLfloat, y: GLfloat, z: GLfloat, w: GLfloat): this {
        this.gl.vertexAttrib4f(this.attributeCount++, x, y, z, w);
        return this;
    }

    vertexAttrib4fv(values: Float32List): this {
        this.gl.vertexAttrib4fv(this.attributeCount++, values);
        return this;
    }

    vertexAttribI4i(x: GLint, y: GLint, z: GLint, w: GLint): this {
        this.gl.vertexAttribI4i(this.attributeCount++, x, y, z, w);
        return this;
    }

    vertexAttribI4iv(values: Int32List): this {
        this.gl.vertexAttribI4iv(this.attributeCount++, values);
        return this;
    }

    vertexAttribI4ui(x: GLuint, y: GLuint, z: GLuint, w: GLuint): this {
        this.gl.vertexAttribI4ui(this.attributeCount++, x, y, z, w);
        return this;
    }

    vertexAttribI4uiv(values: Uint32List): this {
        this.gl.vertexAttribI4uiv(this.attributeCount++, values);
        return this;
    }

    build(): void {
        const gl = this.gl;
        const stride = this.offset;
        for (const pa of this.pointerAttributes) {
            if (pa instanceof FloatPointerAttribute) {
                gl.vertexAttribPointer(pa.index, pa.size, pa.compnentType, pa.normalized, stride, pa.offset);
            } else {
                gl.vertexAttribIPointer(pa.index, pa.size, pa.compnentType, stride, pa.offset);
            }
        }
        for (let i = 0; i < this.attributeCount; i++) {
            gl.enableVertexAttribArray(i);
        }
    }
}

abstract class AbstractPointerAttribute {
    protected constructor(readonly attributeType: 'float' | 'int',
                          readonly index: number, readonly size: number, readonly offset: number,
                          readonly componentBytes: number) {
    }

    get attributeBytes(): number {
        return this.size * this.componentBytes;
    }

}

class FloatPointerAttribute extends AbstractPointerAttribute {
    constructor(index: number, size: number, readonly compnentType: FloatPointerType, readonly normalized: boolean, offset: number) {
        super('float', index, size, offset, getComponentBytes(compnentType));
    }
}

class IntPointerAttribute extends AbstractPointerAttribute {
    constructor(index: number, size: number, readonly compnentType: IntPointerType, offset: number) {
        super('int', index, size, offset, getComponentBytes(compnentType));
    }
}

function getComponentBytes(type: number): number {
    switch (type) {
        case WebGL2RenderingContext.BYTE:
        case WebGL2RenderingContext.UNSIGNED_BYTE:
            return 1;
        case WebGL2RenderingContext.SHORT:
        case WebGL2RenderingContext.UNSIGNED_SHORT:
        case WebGL2RenderingContext.HALF_FLOAT:
            return 2;
        case WebGL2RenderingContext.INT:
        case WebGL2RenderingContext.UNSIGNED_INT:
        case WebGL2RenderingContext.FLOAT:
            return 4;
        default:
            throw new Error('Invalid compnentType ' + type);
    }
}
