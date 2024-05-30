import {Program, Core} from 'glaku'
import {CUBE_NUM, MAX_HEIGHT} from './main'

export const prepass = (core: Core) => new Program(core, {
  id            : 'prepass',
  attributeTypes: {
    a_position: 'vec3',
    a_normal  : 'vec3',
    a_mMatrix : 'mat4'
  },
  uniformTypes: {
    u_vpMatrix: 'mat4'
  },
  vert: /* glsl */ `
        out vec4 v_position;
        out vec4 v_normal;
        out vec3  v_pos_local;
        out float v_id;
        void main() {
          vec4 position = vec4(a_position, 1.0);
          v_position = vec4((a_mMatrix * position).xyz, 1.0);
          mat3 normalMatrix = transpose(inverse(mat3(a_mMatrix)));
          v_normal = vec4(a_normal, 1.0);
          v_pos_local = vec3(a_mMatrix[0][0], a_mMatrix[1][1], a_mMatrix[2][2]) * a_position * ${1 / MAX_HEIGHT};
          v_id = float(gl_InstanceID) * ${1 / CUBE_NUM};
          mat4 mvpMatrix = u_vpMatrix * a_mMatrix;
          gl_Position = mvpMatrix * position;
        }`,
  frag: /* glsl */`
        in vec4 v_position;
        in vec4 v_normal;
        in vec3 v_pos_local;
        in float v_id;
        layout (location = 0) out vec4 o_position;
        layout (location = 1) out vec4 o_normal;
        layout (location = 2) out vec4 o_color;
        void main() {
          o_position = v_position;
          o_normal = v_normal;
          o_color = vec4(v_pos_local, v_id);
        }`
})

