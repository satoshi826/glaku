import {Core, Program, Renderer, Vao} from '../../../../src'

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
  const core = new Core({canvas})
  const renderer = new Renderer(core)
  const program = new Program(core, {
    id            : 'hello',
    attributeTypes: {
      a_position: 'vec2'
    },
    vert: /* glsl */ `
        void main() {
          gl_Position = vec4(a_position, 1.0, 1.0);
        }`,
    frag: /* glsl */`
        out vec4 o_color;
        void main() {
          o_color = vec4(1.0, 0.2, 0.2, 1.0); // (r,g,b,a) -> red
        }`
  })
  const vao = new Vao(core, {
    id        : 'triangle',
    attributes: {
      a_position: [
        0, 0.5, // top center
        0.5, -0.5, // bottom right
        -0.5, -0.5 // bottom left
      ]
    }
  })
  renderer.clear()
  renderer.render(vao, program)
}

