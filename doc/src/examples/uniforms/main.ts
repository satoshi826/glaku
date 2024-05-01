import {Core, Program, Renderer, Vao} from '../../../../src'

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
  const core = new Core({canvas})
  const renderer = new Renderer(core)
  const program = new Program(core, {
    id            : 'red',
    attributeTypes: {
      a_position: 'vec2'
    },
    uniformTypes: {
      u_color : 'vec3',
      u_offset: 'vec2'
    },
    vert: /* glsl */ `
        void main() {
          gl_Position = vec4(a_position+u_offset,1.0,1.0);
        }`,
    frag: /* glsl */`
        out vec4 o_color;
        void main() {
          o_color = vec4(u_color,1.0);
        }`
  })
  const vao = new Vao(core, {
    id        : 'triangle',
    attributes: {
      a_position: [
        0, 0.2,
        0.2, -0.2,
        -0.2, -0.2
      ]
    }
  })

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

