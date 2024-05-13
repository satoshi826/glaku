import {Core, Loop, Program, Renderer, Vao, setHandler} from 'gippy'

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
  const core = new Core({canvas})
  const renderer = new Renderer(core)
  const program = new Program(core, {
    id            : 'animation',
    attributeTypes: {
      a_position: 'vec2'
    },
    uniformTypes: {
      u_elapsed: 'float',
      u_mouse  : 'vec2'
    },
    vert: /* glsl */ `
        vec2 rotate(vec2 v, float a) {
          float s = sin(a);
          float c = cos(a);
          mat2 m = mat2(c, s, -s, c);
          return m * v;
        }
        void main() {
          vec2 pos = rotate(a_position,u_elapsed/500.)+u_mouse;
          gl_Position = vec4(pos,1.0,1.0);
        }`,
    frag: /* glsl */`
        out vec4 o_color;
        void main() {
          o_color = vec4(vec3(.5*sin(.005*u_elapsed)+.6),1.0);
        }`
  })
  const vao = triangle(core)

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

const triangle = (core: Core) => new Vao(core, {
  id        : 'triangle',
  attributes: {
    a_position: [
      0, 0.2,
      0.2, -0.2,
      -0.2, -0.2
    ]
  }
})