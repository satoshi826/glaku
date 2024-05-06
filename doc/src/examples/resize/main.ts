import {Core, Loop, Program, Renderer, Vao, setHandler} from '../../../../src'

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
  const core = new Core({canvas, resizeListener: (fn) => setHandler('resize', fn)})
  const renderer = new Renderer(core)
  const program = new Program(core, {
    id            : 'resize',
    attributeTypes: {
      a_position: 'vec2'
    },
    uniformTypes: {
      u_aspectRatio: 'vec2',
      u_mouse      : 'vec2',
      u_elapsed    : 'float'
    },
    vert: /* glsl */ `
        out vec2 o_pos;
        void main() {
          o_pos = a_position;
          vec2 pos = (0.5*a_position + (u_mouse*u_aspectRatio)) / u_aspectRatio;
          gl_Position = vec4(pos,1.0,1.0);
        }`,
    frag: /* glsl */`
        in vec2 o_pos;
        out vec4 o_color;
        void main() {
          float width = 300.*sin(u_elapsed*0.0005);
          float circles = step(0.5*sin(width*length(o_pos))+0.5,0.5);
          o_color = vec4(vec3(circles),1.0);
        }`
  })
  const vao = plane(core)

  setHandler('resize', ({width, height}: {width: number, height: number} = {width: 100, height: 100}) => {
    const aspectRatio = width / height
    program.set({u_aspectRatio: aspectRatio > 1 ? [aspectRatio, 1] : [1, 1 / aspectRatio]})
  })

  setHandler('mouse', ({x, y}: {x: number, y: number} = {x: 0, y: 0}) => {
    program.set({u_mouse: [x, y]})
  })


  const animation = new Loop({callback: ({elapsed}) => {
    renderer.clear()
    program.set({u_elapsed: elapsed})
    renderer.render(vao, program)
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