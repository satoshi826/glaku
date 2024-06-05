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
          vec3 raw = texture(t_rawTexture, v_uv).rgb;
          vec3 toneMapRaw = raw / (1.0 + raw);

          vec3 blur = texture(t_blurTexture, v_uv).rgb;
          vec3 bloom = 0.15 * (blur);
          vec3 toneMapBloom = 4.0 * bloom / (1.0 + bloom);

          vec3 result = toneMapRaw + toneMapBloom;
          o_color = vec4(result, 1.0);
        }`
})
