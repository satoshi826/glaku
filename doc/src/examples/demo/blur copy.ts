import {Program, Core, Renderer} from 'glaku'

export const blurEffect = (core: Core, shadeRenderer: Renderer) => new Program(core, {
  id            : 'blurEffect',
  attributeTypes: {
    a_position    : 'vec3',
    a_textureCoord: 'vec2'
  },
  uniformTypes: {
    u_isHorizontal: 'bool'
  },
  texture: {
    t_shadeTexture: shadeRenderer.renderTexture[0]
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

        const float[5] weights = float[](0.2270270, 0.1945945, 0.1216216, 0.0540540, 0.0162162);

        ivec2 clampCoord(ivec2 coord, ivec2 size) {
          return max(min(coord, size - 1), 0);
        }

        void main() {
          int invPixelRatio = 1;
          int sampleStep = 4;

          ivec2 coord =  invPixelRatio * ivec2(gl_FragCoord.xy);
          ivec2 size = textureSize(t_shadeTexture, 0);
          vec3 sum = weights[0] * texelFetch(t_shadeTexture, coord, 0).rgb;

          ivec2 offsetUnit = true ? ivec2(1, 0) : ivec2(0, 1);
          ivec2 offset;

          offset = offsetUnit * sampleStep * 1;

          sum += weights[1] * texelFetch(t_shadeTexture, clampCoord(coord + offset, size), 0).rgb;
          sum += weights[1] * texelFetch(t_shadeTexture, clampCoord(coord - offset, size), 0).rgb;

          offset = offsetUnit * sampleStep * 2;
          sum += weights[2] * texelFetch(t_shadeTexture, clampCoord(coord + offset, size), 0).rgb;
          sum += weights[2] * texelFetch(t_shadeTexture, clampCoord(coord - offset, size), 0).rgb;

          offset = offsetUnit * sampleStep * 3;
          sum += weights[3] * texelFetch(t_shadeTexture, clampCoord(coord + offset, size), 0).rgb;
          sum += weights[3] * texelFetch(t_shadeTexture, clampCoord(coord - offset, size), 0).rgb;

          offset = offsetUnit * sampleStep * 4;
          sum += weights[4] * texelFetch(t_shadeTexture, clampCoord(coord + offset, size), 0).rgb;
          sum += weights[4] * texelFetch(t_shadeTexture, clampCoord(coord - offset, size), 0).rgb;

          o_color = vec4(sum, 1.0);
        }`
})
