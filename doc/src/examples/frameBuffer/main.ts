import {Core, Program, RGBA16F, RGBA8, Renderer, Vao} from 'glaku'

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
  const core = new Core({canvas})

  const rendererToFrameBuffer = new Renderer(core, {frameBuffer: [RGBA8]})
  const renderer = new Renderer(core)

  const program = new Program(core, {
    id            : 'triangle',
    attributeTypes: {
      a_position: 'vec2'
    },
    vert: /* glsl */ `
        void main() {
          gl_Position = vec4(a_position,1.0,1.0);
        }`,
    frag: /* glsl */`
        out vec4 o_color;
        void main() {
          o_color = vec4(1.0,0.2,0.2,1.0); // (r,g,b,a) -> red
        }`
  })
  const triangleVao = triangle(core)

  const programEffect = new Program(core, {
    id            : 'effect',
    attributeTypes: {
      a_position    : 'vec2',
      a_textureCoord: 'vec2'
    },
    texture: {
      t_texture: rendererToFrameBuffer.renderTexture[0]
    },
    vert: /* glsl */ `
        out vec2 v_textureCoord;
        void main() {
          v_textureCoord = a_textureCoord;
          gl_Position = vec4(a_position,1.0,1.0);
        }`,
    frag: /* glsl */`
        in vec2 v_textureCoord;
        out vec4 o_color;
        void main() {
          o_color = vec4(texture(t_texture, v_textureCoord).rgb,1.0);
        }`
  })
  const planeVao = plane(core)

  rendererToFrameBuffer.render(triangleVao, program)
  renderer.render(planeVao, programEffect)
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

const plane = (core: Core) => new Vao(core, {
  id        : 'plane',
  attributes: {
    a_position: [
      -1.0, 1.0,
      1.0, 1.0,
      -1.0, -1.0,
      1.0, -1.0
    ],
    a_textureCoord: [
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      1.0, 1.0
    ]
  },
  index: [
    2, 1, 0,
    1, 2, 3
  ]
})