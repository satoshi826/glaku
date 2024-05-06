import {Core, Program, Renderer, Vao} from '../../../../src'

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
  const core = new Core({canvas})
  const renderer = new Renderer(core)
  const program = new Program(core, {
    id            : 'uniforms',
    attributeTypes: {
      a_position: 'vec2'
    },
    uniformTypes: {
      u_color : 'vec3',
      u_offset: 'vec2'
    },
    vert: /* glsl */ `
        out float x;
        void main() {
          x = a_position.x;
          gl_Position = vec4(0.2*a_position+u_offset,1.0,1.0);
        }`,
    frag: /* glsl */`
        in float x;
        out vec4 o_color;
        void main() {
          float wave = 0.5*sin(3.1415*x*0.5)+0.5; // 0 -> 1
          o_color = vec4(wave*u_color,1.0);
        }`
  })
  const vao = triangle(core)

  renderer.clear()

  program.set({
    u_color : [1, 0, 0],
    u_offset: [0.2, -0.2]
  })
  renderer.render(vao, program)

  program.set({
    u_color : [0, 1, 0],
    u_offset: [-0.2, -0.2]
  })
  renderer.render(vao, program)

  program.set({
    u_color : [0, 0, 1],
    u_offset: [0, 0.2]
  })
  renderer.render(vao, program)
}

//----------------------------------------------------------------

const triangle = (core: Core) => new Vao(core, {
  id        : 'triangle',
  attributes: {
    a_position: [
      0, 1,
      1, -1,
      -1, -1
    ]
  }
})