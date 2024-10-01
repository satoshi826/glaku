import {Core, Loop, Program, Renderer, Camera, Vao} from 'glaku'
import {resizeState} from '../state'

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas, pixelRatio: number) => {
  const core = new Core({
    canvas,
    pixelRatio,
    resizeListener: (fn) => resizeState.on(fn)
  })
  const renderer = new Renderer(core, {backgroundColor: [0, 0, 0, 1]})
  const camera = new Camera({near: 0.0001, far: 3, fov: 80})

  const l = 35
  const range = [...Array(l).keys()]
  const vao = new Vao(core, {
    attributes: {
      a_position: range.flatMap(x => range.flatMap(y => range.flatMap(z => [2 * x / l - 1, 2 * y / l - 1, 2 * z / l - 1])))
    }
  })

  const program = new Program(core, {
    id            : 'renderer',
    primitive     : 'POINTS',
    attributeTypes: {a_position: 'vec3'},
    uniformTypes  : {
      u_vpMatrix      : 'mat4',
      u_cameraPosition: 'vec3',
      u_elapsed       : 'float'
    },
    vert: /* glsl */`
    out float v_len;
    void main() {
      vec4 pos = vec4(a_position * cos(u_elapsed * 0.0012 + length(a_position)), 1.0);
      gl_Position = u_vpMatrix * pos;
      v_len = length(pos.xyz - u_cameraPosition);
      gl_PointSize = 16.0 * (1.0 - v_len);
    }`,
    frag: /* glsl */`
    in float v_len;
    out vec4 fragColor;
    void main() {
      fragColor = vec4(3.0 / v_len);
    }`
  })

  resizeState.on(({width, height}) => {
    camera.aspect = width / height
    camera.update()
    program.setUniform({u_vpMatrix: camera.matrix.vp})
  })

  const animation = new Loop({callback: ({elapsed}) => {
    renderer.clear()
    camera.position = [1.8 * Math.cos(elapsed / 3000), Math.cos(elapsed / 8000), 1.0 * Math.sin(elapsed / 3000)]
    camera.update()
    program.setUniform({
      u_vpMatrix      : camera.matrix.vp,
      u_cameraPosition: camera.position,
      u_elapsed       : elapsed
    })
    renderer.render(vao, program)
  }})

  animation.start()
}

