import {Core, Program, Renderer, Vao} from '../../../../src'

export const main = (canvas: HTMLCanvasElement) => {
  const core = new Core({canvas})
  const renderer = new Renderer(core)
  const program = new Program(core, {
    id            : 'red',
    attributeTypes: {
      a_position: 'vec3'
    },
    vert: /* glsl */ `
        void main() {
          gl_Position = vec4(a_position, 1.0);
        }`,
    frag: /* glsl */`
        out vec4 fragColor;
        void main() {
          fragColor = vec4(1.0,0.2,0.2,1.0);
        }`
  })
  const vao = new Vao(core, {
    attributes: {
      a_position: [
        0, 0.5, 0,
        0.5, -0.5, 0,
        -0.5, -0.5, 0.0
      ]
    }
  })
  renderer.render(vao, program)
}

