import {Core, Program, Renderer, Vao} from 'glaku'

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
  const core = new Core({canvas})
  const renderer = new Renderer(core)
  const vao = new Vao(core, {
    attributes: {
      a_position: [
        0, 0.5, // top center
        0.5, -0.5, // bottom right
        -0.5, -0.5 // bottom left
      ]
    }
  })
  const program = new Program(core, {
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
          o_color = vec4(0.4, 0.4, 1.0, 1.0); // (r,g,b,a) -> blue
        }`
  })
  renderer.render(vao, program)
}

