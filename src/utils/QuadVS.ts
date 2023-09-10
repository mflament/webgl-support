// language=glsl
export const QUAD_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec2 position;
out vec2 uv;
void main() {
    uv = (position.xy + 1.0) * 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}`

export const QUAD_POSITIONS = new Float32Array([-1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1]);