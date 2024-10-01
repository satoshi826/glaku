import {Core, Vao, Program, Renderer} from 'glaku'
import {resizeState} from '../../examples/state'

export const main2 = (canvas: OffscreenCanvas) => {

  const core = new Core({canvas,
    resizeListener: (resizeHandler) => resizeState.on(resizeHandler)
  })

  const vao = new Vao(core, {
    id        : 'rect',
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
  const program = new Program(core, {
    id            : 'orb',
    attributeTypes: {a_position: 'vec2'},
    uniformTypes  : {
      u_aspectRatio: 'vec2'
    },
    vert: /* glsl */ `
        out vec2 local_pos;
        void main() {
          vec2 pos = a_position / u_aspectRatio;
          gl_Position = vec4(pos, 1.0, 1.0);
          local_pos = a_position;
        }`,
    frag: /* glsl */ `
        in vec2 local_pos;
        out vec4 o_color;
        void main() {
          float radius = length(local_pos);
          float brightness = 1.0 / radius;
          o_color = vec4(vec3(smoothstep(1.0, 10.0, brightness)), 1.0);
        }`
  })

  const renderer = new Renderer(core)

  resizeState.on(({width, height}) => {
    const aspectRatio = width / height
    const aspectRatioVec = aspectRatio > 1 ? [aspectRatio, 1] : [1, 1 / aspectRatio]
    program.setUniform({u_aspectRatio: aspectRatioVec})
    renderer.clear()
    renderer.render(vao, program)
  })

}

