import {Core, Loop, Program, Renderer, Vao} from 'glaku'
import {mouseState, resizeState} from '../state'

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
  const core = new Core({canvas, resizeListener: (fn) => resizeState.on(fn)})
  const renderer = new Renderer(core)

  const program1 = new Program(core, {
    id            : 'rect',
    attributeTypes: {
      a_position: 'vec2'
    },
    uniformTypes: {
      u_aspectRatio: 'vec2',
      u_mouse      : 'vec2'
    },
    vert: /* glsl */ `
        void main() {
          vec2 pos = (0.2 * a_position + (u_mouse * u_aspectRatio)) / u_aspectRatio;
          gl_Position = vec4(pos,1.0,1.0);
        }`,
    frag: /* glsl */`
        out vec4 o_color;
        void main() {
          o_color = vec4(vec3(0.8), 1.0);
        }`
  })

  const program2 = new Program(core, {
    id            : 'frame',
    attributeTypes: {
      a_position: 'vec2'
    },
    uniformTypes: {
      u_aspectRatio: 'vec2'
    },
    vert: /* glsl */ `
        out vec2 o_pos;
        void main() {
          vec2 pos = a_position / u_aspectRatio;
          o_pos = a_position;
          gl_Position = vec4(pos,1.0,1.0);
        }`,
    frag: /* glsl */`
        in vec2 o_pos;
        out vec4 o_color;
        void main() {
          float on_off = 0.0;
          float ax = abs(o_pos.x);
          float ay = abs(o_pos.y);
          if ((ax > 0.8 && ay > 0.8) && !(ax < 0.95 && ay < 0.95)) on_off = 1.0;
          o_color = vec4(vec3(on_off * 0.5), 1.0);
        }`
  })


  const vao = plane(core)

  resizeState.on(({width, height}) => {
    const aspectRatio = width / height
    const aspectRatioVec = aspectRatio > 1 ? [aspectRatio, 1] : [1, 1 / aspectRatio]
    program1.setUniform({u_aspectRatio: aspectRatioVec})
    program2.setUniform({u_aspectRatio: aspectRatioVec})
  })

  mouseState.on(({x, y}) => {
    program1.setUniform({u_mouse: [x, y]})
  })

  const animation = new Loop({callback: () => {
    renderer.clear()
    renderer.render(vao, program2)
    renderer.render(vao, program1)
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
    ]
  },
  index: [
    2, 1, 0,
    1, 2, 3
  ]
})