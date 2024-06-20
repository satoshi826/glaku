import {Core, Program} from 'glaku'

export const prepass = (core: Core) => new Program(core, {
  id            : 'prepass',
  attributeTypes: {
    a_position: 'vec3',
    a_normal  : 'vec3',
    a_mMatrix : 'mat4'
  },
  uniformTypes: {
    u_vpMatrix     : 'mat4',
    u_vMatrix      : 'mat4',
    u_material_type: 'int' // 0: ground, 1: building, 2: light
  },
  vert: /* glsl */ `
        out vec3 v_position;
        out vec4 v_normal;
        out vec3  v_pos_local;
        out vec4  v_view_position;
        flat out int v_id;
        void main() {
          vec4 position = vec4(a_position, 1.0);
          vec4 worldPosition = a_mMatrix * position;
          v_position = worldPosition.xyz;
          mat3 normalMatrix = transpose(inverse(mat3(a_mMatrix)));
          v_view_position = u_vMatrix * worldPosition;
          v_normal = vec4(a_normal, 1.0);
          v_pos_local = vec3(a_mMatrix[0][0], a_mMatrix[1][1], a_mMatrix[2][2]) * a_position * 0.025;
          mat4 mvpMatrix = u_vpMatrix * a_mMatrix;
          gl_Position = mvpMatrix * position;
          v_id = gl_InstanceID;
        }`,
  frag: /* glsl */`
        in vec3 v_position;
        in vec4 v_normal;
        in vec3 v_pos_local;
        in vec4 v_view_position;
        flat in int v_id;
        layout (location = 0) out vec4 o_position;
        layout (location = 1) out vec4 o_normal;
        layout (location = 2) out vec4 o_color;
        layout (location = 3) out vec4 o_viewPosition;
        void main() {
          o_position = vec4(v_position, float(v_id));
          o_normal = v_normal;
          o_color = vec4(v_pos_local, float(u_material_type));
          o_viewPosition = v_view_position;
        }`
})

