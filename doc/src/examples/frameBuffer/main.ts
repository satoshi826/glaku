import {Core, Loop, Program, RGBA8, Renderer, Vao, calcAspectRatioVec, setHandler} from 'glaku'

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
  const core = new Core({
    canvas,
    resizeListener: (fn) => setHandler('resize', fn)
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
          gl_Position = vec4(0.4 * rotate(a_position, u_elapsed / 500.0) / u_aspectRatio, 1.0, 1.0);
          y = a_position.y;
        }`,
    frag: /* glsl */`
        in float y;
        out vec4 o_color;
        void main() {
          o_color = vec4(vec3(step(-cos(20.0*y), 0.0)),1.0);
        }`
  })

  const blurEffect = new Program(core, {
    id            : 'effect',
    attributeTypes: {
      a_position    : 'vec2',
      a_textureCoord: 'vec2'
    },
    uniformTypes: {
      u_resolution: 'vec2',
      u_elapsed   : 'float'
    },
    texture: {
      t_texture: rendererToFrameBuffer.renderTexture[0]
    },
    vert: /* glsl */ `
        out vec2 v_textureCoord;
        void main() {
          v_textureCoord = a_textureCoord;
          gl_Position = vec4(a_position,1.0,1.0); // screen covered
        }`,
    frag: /* glsl */`
        in vec2 v_textureCoord;
        out vec4 o_color;
        #define RATE 0.75
        float rand(vec2 co){
          return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453) * 2.0 - 1.0;
        }
        float offset(float blocks, vec2 uv, float time) {
          return rand(vec2(time, floor(uv.y * blocks)));
        }
        void main() {

          vec3 framebufferColor = texture(t_texture, v_textureCoord).rgb;

          vec2 uv = vec2(gl_FragCoord.xy / u_resolution);
          vec3 effected = vec3(
            texture(t_texture, uv + vec2(offset(128.0, uv, u_elapsed) * 0.03, 0.0)).r,
            texture(t_texture, uv + vec2(offset(128.0, uv, u_elapsed) * 0.03 * 0.16666666, 0.0)).g,
            texture(t_texture, uv + vec2(offset(64.0, uv, u_elapsed) * 0.03, 0.0)).b
          );

          vec3 result = uv.x < 0.5 ? framebufferColor : effected;
          o_color = vec4(result, 1.0);
        }`
  })
  const planeVao = plane(core)


  setHandler('resize', ({width, height}: {width: number, height: number} = {width: 100, height: 100}) => {
    program.set({u_aspectRatio: calcAspectRatioVec(width, height)})
    blurEffect.set({u_resolution: [width, height]})
  })

  const animation = new Loop({callback: ({elapsed}) => {
    rendererToFrameBuffer.clear()
    renderer.clear()
    program.set({u_elapsed: elapsed})
    rendererToFrameBuffer.render(planeVao, program)
    renderer.render(planeVao, blurEffect)
  }})

  animation.start()
}

//----------------------------------------------------------------

const plane = (core: Core) => new Vao(core, {
  id        : 'plane',
  attributes: {
    a_position: [
      -1.0, 1.0,
      1.0, 1.0,
      -1.0, -1.0,
      1.0, -1.0
    ],
    a_textureCoord: [
      0.0, 1.0,
      1.0, 1.0,
      0.0, 0.0,
      1.0, 0.0
    ]
  },
  index: [
    2, 1, 0,
    1, 2, 3
  ]
})