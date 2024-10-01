import {Vao, Program, Renderer, State, calcAspectRatioVec, Core, RGBA8, RGBA16F, ColorArray, TextureWithInfo, Loop, RGBA32F, plane2D} from 'glaku'

const imageState = new State<ImageData | null>(null)
const resizeState = new State({width: 0, height: 0})
const mouseState = new State({x: 0, y: 0.6})

class Renderers {
  curIndex = 0
  prevIndex = 1
  private renderers
  constructor(core: Core) {
    this.renderers = [
      new Renderer(core, {frameBuffer: [RGBA32F], pixelRatio: 0.0625}),
      new Renderer(core, {frameBuffer: [RGBA32F], pixelRatio: 0.0625})
    ]
  }
  swap() {
    [this.curIndex, this.prevIndex] = [this.prevIndex, this.curIndex]
  }
  get currentRenderer() {
    return this.renderers[this.curIndex]
  }
  get prevTexture() {
    return this.renderers[this.prevIndex].renderTexture
  }
  get curTexture() {
    return this.renderers[this.curIndex].renderTexture
  }
}

onmessage = async({data}) => {
  const {canvas, image, state, pixelRatio} = data
  if (state?.resize) resizeState.set(state.resize)
  if (state?.mouse) mouseState.set(state.mouse)
  if (image) imageState.set(image)
  if (canvas) main(canvas, pixelRatio)
}

async function main(canvas: OffscreenCanvas, pixelRatio = 2) {
  const core = new Core({
    canvas,
    resizeListener: (resizeHandler) => resizeState.on(resizeHandler),
    pixelRatio    : Math.max(2, pixelRatio)
  })

  const transparent : ColorArray = [0, 0, 0, 0]
  const fontRenderer = new Renderer(core, {backgroundColor: transparent, frameBuffer: [RGBA8, RGBA16F]})
  const waveRenderers = new Renderers(core)
  const highlightRenderer = new Renderer(core, {backgroundColor: transparent, frameBuffer: [RGBA16F]})
  const renderer = new Renderer(core, {backgroundColor: transparent})

  const image = await new Promise<ImageData>((resolve) => {
    const off = imageState.on((img) => {
      if (img) {
        resolve(img)
        off()
      }
    })
  })
  const texture = core.createTexture({image})

  const planeVAOflipY = new Vao(core, plane2D(true))
  const planeVAO = new Vao(core, plane2D())

  const fontProgram = new Program(core, {
    attributeTypes: {
      a_position    : 'vec2',
      a_textureCoord: 'vec2'
    },
    uniformTypes: {
      u_aspectRatio      : 'vec2',
      u_aspectRatio_image: 'vec2',
      u_resolution       : 'vec2'
    },
    texture: {t_texture: texture},
    vert   : /* glsl */ `
        out vec2 local_pos;
        out vec2 v_uv;
        void main() {
          vec2 pos = u_aspectRatio_image * 0.5 * a_position / u_aspectRatio;
          v_uv = a_textureCoord;
          gl_Position = vec4(pos, 1.0, 1.0);
        }`,
    frag: /* glsl */ `
        in vec2 v_uv;
        layout (location = 0) out vec4 o_font;
        layout (location = 1) out vec4 o_normal;
        vec4 fetch(vec2 coord, vec2 scale) {return texture(t_texture, vec2(v_uv + coord * scale));}
        void main() {
          vec2 scale = 1.0 / u_resolution;
          vec4 font;
          font += fetch(vec2(0.0, 0.0), scale);
          font += fetch(vec2(0.0, 1.0), scale);
          font += fetch(vec2(0.0, -1.0), scale);
          font += fetch(vec2(1.0, 0.0), scale);
          font += fetch(vec2(1.0, 1.0), scale);
          font += fetch(vec2(1.0, -1.0), scale);
          font += fetch(vec2(-1.0, 0.0), scale);
          font += fetch(vec2(-1.0, 1.0), scale);
          font += fetch(vec2(-1.0, -1.0), scale);
          float gray = font.a;
          o_font = font;
          o_normal = vec4(-dFdx(gray), -dFdy(gray), 0.0, 1.0);
        }`
  })
  fontProgram.setUniform({u_aspectRatio_image: calcAspectRatioVec(image.width, image.height)})

  const waveProgram = new Program(core, {
    attributeTypes: {
      a_position    : 'vec2',
      a_textureCoord: 'vec2'
    },
    uniformTypes: {
      u_aspectRatio: 'vec2',
      u_resolution : 'vec2',
      u_mouse      : 'vec2'
    },
    texture: {
      t_preWave: null,
      t_font   : fontRenderer.renderTexture[0]
    },
    vert: baseVert,
    frag: /* glsl */ `
        in vec2 v_uv;
        out vec4 o_wave;
        vec4 fetch(vec2 coord, vec2 scale) {return texture(t_preWave, vec2(v_uv + coord * scale));}
        vec4 fetchFont(vec2 coord, vec2 scale) {return texture(t_font, vec2(v_uv + coord * scale));}
        void main() {
          vec2 scale = 1.0 / u_resolution;

          vec2 currentPoint = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
          vec2 mouseVec = currentPoint - u_mouse * u_aspectRatio;

          float currentPos = fetch(vec2(0.0, 0.0), scale).r;
          float currentVel = fetch(vec2(0.0, 0.0), scale).g;
          float currentFont = fetchFont(vec2(0.0, 0.0), scale).r;

          float diff = 0.0;
          diff += fetch(vec2(0.0, 1.0), scale).r - currentPos;
          diff += fetch(vec2(0.0, -1.0), scale).r - currentPos;
          diff += fetch(vec2(1.0, 0.0), scale).r - currentPos;
          diff += fetch(vec2(-1.0, 0.0), scale).r - currentPos;
          diff *= 0.25 * 0.75;
          diff +=  length(mouseVec) < 0.075 ? 1.5 : 0.0;
          float nextPos = currentFont < 0.001 ? 0.995 * (diff + currentVel) + currentPos : 0.0;
          float nextVec = currentFont < 0.001 ? nextPos - currentPos: 0.0;
          o_wave = vec4(vec2(nextPos, nextVec), 1.0, 1.0);
        }`
  })

  const highlightProgram = new Program(core, {
    attributeTypes: {
      a_position    : 'vec2',
      a_textureCoord: 'vec2'
    },
    uniformTypes: {
      u_aspectRatio: 'vec2',
      u_resolution : 'vec2',
      u_mouse      : 'vec2'
    },
    texture: {
      t_font  : fontRenderer.renderTexture[0],
      t_normal: fontRenderer.renderTexture[1]
    },
    vert: baseVert,
    frag: /* glsl */ `
        in vec2 v_uv;
        out vec4 o_color;
        void main() {
          float shortSide = min(u_resolution.x, u_resolution.y);
          vec2 currentPoint = (gl_FragCoord.xy * 2.0 - u_resolution) / shortSide;
          float currentFont = texture(t_font, v_uv).r;
          vec2 currentNormal = texture(t_normal, v_uv).rg;
          float currentEdge = length(currentNormal.xy);
          if (currentEdge < 0.00001) {
            discard;
          }
          vec2 lightVec = (u_mouse * u_aspectRatio) - currentPoint;
          vec2 lightVecNormal = normalize(lightVec);
          float lightVecLen = length(lightVec);
          float lightDot = dot(currentNormal, lightVecNormal);
          float tmp;
          for (int i = 1; i < 100; i++) {
            tmp += texture(t_font, v_uv + 0.0025 * lightVecNormal * float(i)).r;
          };
          float result = min(1.0 / tmp, 80.0) * ${core.pixelRatio.toFixed(2)} * 0.01 * lightDot / lightVecLen;
          o_color = vec4(length(vec2(result * normalize(currentNormal))));
        }`
  })

  const blurPass = getBlurPass(core, highlightRenderer.renderTexture[0])

  const compositeProgram = new Program(core, {
    attributeTypes: {
      a_position    : 'vec2',
      a_textureCoord: 'vec2'
    },
    texture: {
      t_blur0    : blurPass.results[0],
      t_blur1    : blurPass.results[1],
      t_blur2    : blurPass.results[2],
      t_blur3    : blurPass.results[3],
      t_blur4    : blurPass.results[4],
      t_highlight: highlightRenderer.renderTexture[0],
      t_font     : fontRenderer.renderTexture[0],
      t_wave     : null
    },
    vert: /* glsl */ `
        out vec2 v_uv;
        void main() {
          v_uv = a_textureCoord;
          gl_Position = vec4(a_position, 1.0, 1.0);
        }`,
    frag: /* glsl */ `
        in vec2 v_uv;
        out vec4 o_color;
        void main() {
          float font = texture(t_font, v_uv).r;
          float blur0 = texture(t_blur0, v_uv).r;
          float blur1 = texture(t_blur1, v_uv).r;
          float blur2 = texture(t_blur2, v_uv).r;
          float blur3 = texture(t_blur3, v_uv).r;
          float blur4 = texture(t_blur4, v_uv).r;
          float wave = abs(texture(t_wave, v_uv).r * 0.005);
          float bloom = (0.5 * blur0 + 0.5 * blur1 + 2.0 * blur2 + 4.0 * blur3 + 8.0 * blur4 ) / 4.0;
          float light = texture(t_highlight, v_uv).r;
          o_color = vec4(0.5 * light + bloom + 0.15 * font + wave);
        }`
  })


  mouseState.on(({x, y}) => {
    highlightProgram.setUniform({u_mouse: [x, y]})
    highlightRenderer.render(planeVAO, highlightProgram)
    waveProgram.setUniform({u_mouse: [x, y]})
  })

  resizeState.on(({width, height}) => {
    const ar = calcAspectRatioVec(width, height)
    fontProgram.setUniform({
      u_resolution : [core.pixelRatio * width, core.pixelRatio * height],
      u_aspectRatio: ar
    })
    highlightProgram.setUniform({
      u_resolution : [core.pixelRatio * width, core.pixelRatio * height],
      u_aspectRatio: ar
    })
    waveProgram.setUniform({
      u_resolution: [
        waveRenderers.currentRenderer.pixelRatio * width,
        waveRenderers.currentRenderer.pixelRatio * height
      ],
      u_aspectRatio: ar
    })
    fontRenderer.render(planeVAOflipY, fontProgram)
    highlightRenderer.render(planeVAO, highlightProgram)
    blurPass.render()
    renderer.render(planeVAO, compositeProgram)
  })


  const animation = new Loop({callback: () => {
    waveProgram.setTexture({t_preWave: waveRenderers.prevTexture[0]})
    waveRenderers.currentRenderer.render(planeVAO, waveProgram)
    waveRenderers.swap()

    highlightRenderer.render(planeVAO, highlightProgram)
    blurPass.render()
    compositeProgram.setTexture({t_wave: waveRenderers.curTexture[0]})
    renderer.render(planeVAO, compositeProgram)
  }, interval: 0})
  animation.start()
}

export default {}

const baseVert = /* glsl */ `
out vec2 v_uv;
void main() {
  v_uv = a_textureCoord;
  gl_Position = vec4(a_position, 1.0, 1.0);
}`

const getBlurPass = (core: Core, targetTex : TextureWithInfo) => {

  const basePixelRatio = core.pixelRatio
  const pixelRatios = [1, 0.5, 0.25, 0.125, 0.03125]

  const renderers = pixelRatios.map(pixelRatio => [
    new Renderer(core, {frameBuffer: [RGBA16F], pixelRatio, backgroundColor: [0, 0, 0, 0]}),
    new Renderer(core, {frameBuffer: [RGBA16F], pixelRatio, backgroundColor: [0, 0, 0, 0]})
  ])

  const blurProgram = blurEffect(core, targetTex)
  const planeVao = new Vao(core, {
    id: 'blurPlane',
    ...plane2D()
  })

  return {
    render: () => {
      renderers.forEach((renderer, index) => {
        renderer[0].clear()
        renderer[1].clear()
        const preRenderer = index === 0 ? null : renderers[index - 1]
        const baseTex = preRenderer?.[1].renderTexture[0] ?? targetTex
        const invPixelRatio = (preRenderer?.[0].pixelRatio ?? basePixelRatio) / renderer[0].pixelRatio
        blurProgram.setUniform({u_invPixelRatio: invPixelRatio})
        blurProgram.setUniform({u_isHorizontal: 1})
        blurProgram.setTexture({t_preBlurTexture: baseTex})
        renderer[0].render(planeVao, blurProgram)
        blurProgram.setUniform({u_invPixelRatio: 1})
        blurProgram.setUniform({u_isHorizontal: 0})
        blurProgram.setTexture({t_preBlurTexture: renderer[0].renderTexture[0]})
        renderer[1].render(planeVao, blurProgram)
      })
    },
    results: renderers.map(renderer => renderer[1].renderTexture[0])
  }
}

const blurEffect = (core: Core, texture: TextureWithInfo) => new Program(core, {
  id            : 'blurEffect',
  attributeTypes: {
    a_position    : 'vec2',
    a_textureCoord: 'vec2'
  },
  uniformTypes: {
    u_isHorizontal : 'bool',
    u_invPixelRatio: 'int'
  },
  texture: {
    t_preBlurTexture: texture
  },
  vert: /* glsl */ `
        out vec2 v_uv;
        void main() {
          v_uv  = a_textureCoord;
          gl_Position = vec4(a_position, 0.0, 1.0);
        }`,
  frag: /* glsl */`
        in vec2 v_uv;
        out vec4 o_color;

        const float[5] weights = float[](0.2270270, 0.1945945, 0.1216216, 0.0540540, 0.0162162);

        ivec2 clampCoord(ivec2 coord, ivec2 size) {
          return max(min(coord, size - 1), 0);
        }

        void main() {
          int sampleStep = 2 * u_invPixelRatio;

          ivec2 coord =   u_invPixelRatio * ivec2(gl_FragCoord.xy);
          ivec2 size = textureSize(t_preBlurTexture, 0);
          vec3 sum = weights[0] * texelFetch(t_preBlurTexture, coord, 0).rgb;

          ivec2 offsetUnit = u_isHorizontal ? ivec2(1, 0) : ivec2(0, 1);
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

