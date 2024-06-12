import {Core, Program, TextureWithInfo} from 'glaku'
import {BlurPass} from './blur'

export const postEffect = (core: Core, rawTexture: TextureWithInfo, blurPass: BlurPass) => new Program(core, {
  id            : 'postEffect',
  attributeTypes: {
    a_position    : 'vec3',
    a_textureCoord: 'vec2'
  },
  texture: {
    t_rawTexture  : rawTexture,
    t_blurTexture0: blurPass.result0,
    t_blurTexture1: blurPass.result1,
    t_blurTexture2: blurPass.result2
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

          vec3 blur0 = texture(t_blurTexture0, v_uv).rgb;
          vec3 blur1 = texture(t_blurTexture1, v_uv).rgb;
          vec3 blur2 = texture(t_blurTexture2, v_uv).rgb;

          vec3 blur = 1.0 * blur0 + 0.5 * blur1 +  0.5 * blur2;

          vec3 bloom = 0.05 * (blur);
          vec3 toneMapBloom = 6.0 * bloom / (1.0 + bloom);

          vec3 result = toneMapRaw + toneMapBloom;
          o_color = vec4(result, 1.0);
        }`
})
