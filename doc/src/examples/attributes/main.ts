import {Core, Program, Renderer, Vao} from 'glaku'

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
  const core = new Core({canvas})
  const renderer = new Renderer(core)
  const vao = new Vao(core, {
    id        : 'colorTriangle',
    attributes: {
      a_position: [
        0, 0.5, // top center
        0.5, -0.5, // bottom right
        -0.5, -0.5 // bottom left
      ],
      a_color: [
        1, 0, 0, //r
        0, 1, 0, //g
        0, 0, 1 //b
      ]
    }
  })
  const program = new Program(core, {
    id            : 'attributes',
    attributeTypes: {
      a_position: 'vec2',
      a_color   : 'vec3'
    },
    vert: /* glsl */ `
        out vec3 v_color;
        void main() {
          v_color = a_color;
          gl_Position = vec4(a_position, 1.0, 1.0);
        }`,
    frag: /* glsl */`
        in vec3 v_color;
        out vec4 o_color;
        void main() {
          o_color = vec4(v_color, 1.0);
        }`
  })
  renderer.clear()
  renderer.render(vao, program)
}

