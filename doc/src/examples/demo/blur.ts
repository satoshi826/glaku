import {Core, Program, RGBA16F, Renderer, TextureWithInfo, Vao, plane} from 'glaku'

export const getBlurPass = (core: Core, targetTex : TextureWithInfo) => {
  const rendererH = new Renderer(core, {frameBuffer: [RGBA16F], pixelRatio: 1})
  const rendererV = new Renderer(core, {frameBuffer: [RGBA16F], pixelRatio: 1})

  const blurProgram = blurEffect(core, targetTex)
  const planeVao = new Vao(core, {
    id: 'blurPlane',
    ...plane()
  })

  return {
    render: () => {
      rendererH.clear()
      rendererV.clear()

      blurProgram.setUniform({u_isHorizontal: 1})
      blurProgram.setTexture({t_preBlurTexture: targetTex})
      rendererH.render(planeVao, blurProgram)

      blurProgram.setUniform({u_isHorizontal: 0})
      blurProgram.setTexture({t_preBlurTexture: rendererH.renderTexture[0]})
      rendererV.render(planeVao, blurProgram)
    },
    result: rendererV.renderTexture[0],
    blurProgram
  }
}

export const blurEffect = (core: Core, texture: TextureWithInfo) => new Program(core, {
  id            : 'blurEffect',
  attributeTypes: {
    a_position    : 'vec3',
    a_textureCoord: 'vec2'
  },
  uniformTypes: {
    u_isHorizontal: 'bool'
  },
  texture: {
    t_preBlurTexture: texture
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
          int invPixelRatio = 2;
          int sampleStep = 2;

          ivec2 coord =  1 * ivec2(gl_FragCoord.xy);
          ivec2 size = textureSize(t_preBlurTexture, 0);
          vec3 sum = weights[0] * texelFetch(t_preBlurTexture, coord, 0).rgb;

          ivec2 offsetUnit = true ? ivec2(1, 0) : ivec2(0, 1);
          ivec2 offset;

          offset = offsetUnit * sampleStep * 1;

          sum += weights[1] * texelFetch(t_preBlurTexture, clampCoord(coord + offset, size), 0).rgb;
          sum += weights[1] * texelFetch(t_preBlurTexture, clampCoord(coord - offset, size), 0).rgb;

          offset = offsetUnit * sampleStep * 2;
          sum += weights[2] * texelFetch(t_preBlurTexture, clampCoord(coord + offset, size), 0).rgb;
          sum += weights[2] * texelFetch(t_preBlurTexture, clampCoord(coord - offset, size), 0).rgb;

          offset = offsetUnit * sampleStep * 3;
          sum += weights[3] * texelFetch(t_preBlurTexture, clampCoord(coord + offset, size), 0).rgb;
          sum += weights[3] * texelFetch(t_preBlurTexture, clampCoord(coord - offset, size), 0).rgb;

          offset = offsetUnit * sampleStep * 4;
          sum += weights[4] * texelFetch(t_preBlurTexture, clampCoord(coord + offset, size), 0).rgb;
          sum += weights[4] * texelFetch(t_preBlurTexture, clampCoord(coord - offset, size), 0).rgb;

          o_color = vec4(sum, 1.0);
        }`
})
