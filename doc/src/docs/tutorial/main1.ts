import {Core, Vao, Program, Renderer, Loop} from 'glaku'
import {resizeState} from '../../examples/state'

export const main1 = (canvas: HTMLCanvasElement) => {

  const core = new Core({canvas,
    resizeListener: (resizeHandler) => resizeState.on(resizeHandler),
    options       : ['BLEND']
  })
  core.gl.blendFunc(core.gl.ONE, core.gl.ONE)

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
    id            : 'orbs',
    attributeTypes: {a_position: 'vec2'},
    uniformTypes  : {
      u_elapsed    : 'float',
      u_aspectRatio: 'vec2',
      u_orbSize    : 'float'
    },
    vert: /* glsl */ `
        out vec2 local_pos;
        void main() {
          vec2 pos = a_position * u_orbSize / u_aspectRatio;
          float angel = 0.001 * u_elapsed / u_orbSize;
          vec2 rotate = u_orbSize * vec2(sin(angel), cos(angel)) / u_aspectRatio;
          gl_Position = vec4(pos + rotate, 1.0, 1.0);
          local_pos = a_position;
        }`,
    frag: /* glsl */ `
        in vec2 local_pos;
        out vec4 o_color;
        void main() {
          float radius = length(local_pos);
          float brightness = 1.0 / radius;
          o_color = vec4(vec3(smoothstep(0.8, 25.0, brightness)), 1.0);
        }`
  })

  resizeState.on(({width, height}) => {
    const aspectRatio = width / height
    const aspectRatioVec = aspectRatio > 1 ? [aspectRatio, 1] : [1, 1 / aspectRatio]
    program.setUniform({u_aspectRatio: aspectRatioVec})
  })

  const renderer = new Renderer(core)

  const orbSizes = [...Array(50)].map((_, i) => (i + 5) * 0.025)

  const animation = new Loop({callback: ({elapsed}) => {
    renderer.clear()
    program.setUniform({u_elapsed: elapsed})
    orbSizes.forEach((size) => {
      program.setUniform({u_orbSize: size})
      renderer.render(vao, program)
    })
  }, interval: 0})
  animation.start()
}

