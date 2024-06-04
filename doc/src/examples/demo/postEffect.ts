import {Core, Program, TextureWithInfo} from 'glaku'

export const postEffect = (core: Core, rawTexture: TextureWithInfo, blurTexture: TextureWithInfo) => new Program(core, {
  id            : 'postEffect',
  attributeTypes: {
    a_position    : 'vec3',
    a_textureCoord: 'vec2'
  },
  texture: {
    t_rawTexture : rawTexture,
    t_blurTexture: blurTexture
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
          vec3 color = texture(t_rawTexture, v_uv).rgb;
          o_color = vec4(color, 1.0);
        }`
})
