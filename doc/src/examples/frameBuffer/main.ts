import {Core, Loop, Program, RGBA8, Renderer, Vao, calcAspectRatioVec, plane2D} from 'glaku'
import {resizeState} from '../state'

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas, pixelRatio: number) => {
  const core = new Core({
    canvas,
    resizeListener: (fn) => resizeState.on(fn),
    pixelRatio
  })

  const rendererToFrameBuffer = new Renderer(core, {frameBuffer: [RGBA8]})
  const renderer = new Renderer(core)

  const program = new Program(core, {
    id            : 'triangle',
    attributeTypes: {
      a_position: 'vec2'
    },
    uniformTypes: {
      u_elapsed    : 'float',
      u_aspectRatio: 'vec2'
    },
    vert: /* glsl */ `
        vec2 rotate(vec2 v, float a) {
          float s = sin(a);
          float c = cos(a);
          mat2 m = mat2(c, s, -s, c);
          return m * v;
        }
        out float y;
        void main() {
          gl_Position = vec4(0.4 * rotate(a_position, u_elapsed / 600.0) / u_aspectRatio, 1.0, 1.0);
          y = a_position.y;
        }`,
    frag: /* glsl */`
        in float y;
        out vec4 o_color;
        void main() {
          o_color = vec4(vec3(step(-cos(20.0*y), 0.0)), 1.0); // zebra pattern
        }`
  })

  const glitchEffect = new Program(core, {
    id            : 'glitchEffect',
    attributeTypes: {
      a_position    : 'vec2',
      a_textureCoord: 'vec2'
    },
    texture: {
      t_texture: rendererToFrameBuffer.renderTexture[0]
    },
    vert: /* glsl */ `
        out vec2 v_textureCoord;
        void main() {
          v_textureCoord = a_textureCoord;
          gl_Position = vec4(a_position, 1.0, 1.0); // screen covered
        }`,
    frag: /* glsl */`
        in vec2 v_textureCoord;
        out vec4 o_color;
        float rand(vec2 co){
          return fract(sin(dot(co ,vec2(12.9898,78.233))) * 43758.5453) * 2.0 - 1.0;
        }
        float offsetUniform(float blocks, vec2 uv) {
          return rand(vec2(0, floor(uv.y * blocks)));
        }
        void main() {
          vec3 framebufferColor = texture(t_texture, v_textureCoord).rgb;
          float effectedR = texture(t_texture, v_textureCoord + vec2(offsetUniform(64.0, v_textureCoord) * 0.1, 0.0)).r;
          vec3 result = v_textureCoord.x < 0.5 ? framebufferColor : vec3(effectedR, framebufferColor.gb);
          o_color = vec4(result, 1.0);
        }`
  })
  const planeVao = new Vao(core, plane2D())

  resizeState.on(({width, height}) => {
    program.setUniform({u_aspectRatio: calcAspectRatioVec(width, height)})
  })

  const animation = new Loop({callback: ({elapsed}) => {
    renderer.clear()
    rendererToFrameBuffer.clear()

    rendererToFrameBuffer.render(planeVao, program)
    program.setUniform({u_elapsed: elapsed})

    renderer.render(planeVao, glitchEffect)
  }})
  animation.start()
}