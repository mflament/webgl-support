interface AttributeDefinition {
    arraySize: GLenum;
    arrayStride: GLenum;
    arrayType: GLenum;
    arrayNormalized: GLboolean;
    currentVertexAttrib: Float32Array;
    arrayInteger: GLboolean;
    arrayDivisor: GLint;
}

export function collectAttributes(gl: WebGL2RenderingContext, program: WebGLProgram): AttributeDefinition[] {
    gl.useProgram(program);
    const attributeCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    const attributes: AttributeDefinition[] = [];
    for (let i = 0; i < attributeCount; i++) {
        attributes.push({
            arraySize: gl.getVertexAttrib(i, gl.VERTEX_ATTRIB_ARRAY_SIZE),
            arrayStride: gl.getVertexAttrib(i, gl.VERTEX_ATTRIB_ARRAY_STRIDE),
            arrayType: gl.getVertexAttrib(i, gl.VERTEX_ATTRIB_ARRAY_TYPE),
            arrayNormalized: gl.getVertexAttrib(i, gl.VERTEX_ATTRIB_ARRAY_NORMALIZED),
            currentVertexAttrib: gl.getVertexAttrib(i, gl.CURRENT_VERTEX_ATTRIB),
            arrayInteger: gl.getVertexAttrib(i, gl.VERTEX_ATTRIB_ARRAY_INTEGER),
            arrayDivisor: gl.getVertexAttrib(i, gl.VERTEX_ATTRIB_ARRAY_DIVISOR),
        });
    }
    return attributes;
}