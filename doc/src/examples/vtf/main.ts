import {Core, Loop, Program, Renderer, Vao} from 'glaku'
import {resizeState} from '../state'

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
  const core = new Core({
    canvas,
    resizeListener: (fn) => resizeState.on(fn)
  })
  const renderer = new Renderer(core)

  const w = 200
  const h = 200

  const vao = new Vao(core, {
    id        : 'vtf',
    attributes: {
      a_index: [...Array(h * w)].map((_, i) => i)
    }
  })

  const dataTexture = core.createTexture({
    array: new Float32Array([...Array(h * w)].flatMap((_, i) => {
      const r = 2 * i / (w * h)
      const t = r * 8000
      return [r * Math.cos(t), r * Math.sin(t), 0.0, 0.0]
    })),
    width : w,
    height: h
  })

  const program = new Program(core, {
    id            : 'vtf',
    attributeTypes: {a_index: 'float'},
    uniformTypes  : {u_elapsed: 'float'},
    texture       : {t_data: dataTexture},
    primitive     : 'POINTS',
    vert          : /* glsl */ `
        void main() {
          float x = mod(a_index, ${w}.0) / ${w}.0;
          float y = floor(a_index / ${w}.0) / ${h}.0;
          vec4 pos = texture(t_data, vec2(x, y));
          float scale = (cos(u_elapsed * 0.0005) + 1.005);
          gl_PointSize = 10.0 * scale;
          gl_Position = vec4(100.0 * scale * pos.xy, 0.0, 1.0);

        }`,
    frag: /* glsl */`
        out vec4 o_color;
        void main() {
          o_color = vec4(1.0);
        }`
  })

  const animation = new Loop({callback: ({elapsed}) => {
    renderer.clear()
    program.setUniform({u_elapsed: elapsed})
    renderer.render(vao, program)
  }})
  animation.start()

}

//----------------------------------------------------------------