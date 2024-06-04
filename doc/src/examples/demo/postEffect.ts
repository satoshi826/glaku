import {Core, Renderer} from 'glaku'
import {Program} from '../../../../src'

export const postEffect = (core: Core, shadeRenderer: Renderer) => new Program(core, {
  id            : 'postEffect',
  attributeTypes: {
    a_position    : 'vec3',
    a_textureCoord: 'vec2'
  },
  texture: {
    t_blurTexture: shadeRenderer.renderTexture[0]
  },
  vert: /* glsl */ `
        out vec2 v_uv;
        void main() {
          v_uv  = a_textureCoord;
          gl_Position = vec4(a_position, 1.0);
        }`,
  frag: /* glsl */`
        in vec2 v_uv;
        out vec4 o_color;
        void main() {
          vec3 color = texture(t_blurTexture, v_uv).rgb;
          if (color == vec3(0.0)) {
            discard;
          }
          o_color = vec4(color, 1.0);
        }`
})
