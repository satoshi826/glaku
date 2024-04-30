import {Core, Program, Renderer, Vao} from '../../../../src'

export const main = (canvas: HTMLCanvasElement) => {
  const core = new Core({canvas})
  const renderer = new Renderer(core)
  const program = new Program(core, {
    id            : 'color',
    attributeTypes: {
      a_position: 'vec2',
      a_color   : 'vec3'
    },
    vert: /* glsl */ `
        out vec3 color;
        void main() {
          color = a_color;
          gl_Position = vec4(a_position,1.0,1.0);
        }`,
    frag: /* glsl */`
        in vec3 color;
        out vec4 fragColor;
        void main() {
          fragColor = vec4(color,1.0);
        }`
  })
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
  renderer.render(vao, program)
}

