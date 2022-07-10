import { GLContext } from "../dist";
import { UniformDefinitions } from "../dist";
// language=glsl
const VS = `
    #version 300 es
    precision highp float;
    layout(location=0) in vec2 position;
    out vec2 uv;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
        uv = position;
    }
`;
// language=glsl
const FS = `
    #version 300 es

    precision highp float;

    struct Shape {
        vec3 position;
        mat3 rotation;
        vec4 color;
        float shininess;
        int shapeType;
        int numChildren[2];
    };

    uniform float uMaxDst;
    uniform mat3 uEpsilon;
    uniform int uShadowBias[5];
    uniform Shape uShapesArray[2];

    layout(std140) uniform uCamera {
        mat4 matrixWorld;
        mat4 projectionMatrixInverse;
        mat4 mat4s[2];
        mat3 mat3s[2];
    };

    layout(std140) uniform uShapes {
        Shape shape;
        Shape shapes[1];
        int numShapes;
    };

    layout(std140) uniform uLights {
        vec3 ambientColor;
        vec3 light;
        vec3 lightColor;
        int lightType;
    };
    
    layout(std140) uniform uShape {
        int i;
    };
    
    in vec2 uv;
    out vec4 color;

    void main() {
        float f = uMaxDst + uEpsilon[0].r + float(uShadowBias[0]);
        f += uShapesArray[0].shininess + float(i);
        color = vec4(f);
    }
`;
const context = new GLContext();
const gl = context.gl;
const program = context.programBuilder().vertexShader(VS).fragmentShader(FS).link();
console.log(UniformDefinitions.collect(gl, program));
//# sourceMappingURL=index.js.map