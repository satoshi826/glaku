import {Core, Loop, Program, Renderer, Vao, box, calcAspectRatioVec, setHandler} from '../../../../src'

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
  const core = new Core({canvas, resizeListener: (fn) => setHandler('resize', fn)})
  const renderer = new Renderer(core)

  const program2 = new Program(core, {
    id            : 'frame',
    attributeTypes: {
      a_position: 'vec2'
    },
    uniformTypes: {
      u_aspectRatio: 'vec2'
    },
    vert: /* glsl */ `
        out vec2 o_pos;
        void main() {
          vec2 pos = a_position / u_aspectRatio;
          gl_Position = vec4(pos,1.0,1.0);
        }`,
    frag: /* glsl */`
        out vec4 o_color;
        void main() {
          o_color = vec4(vec3(0.5), 1.0);
        }`
  })


  const vao = plane(core)
  // const vao2 = new Vao(core, {
  //   id: 'box',
  //   ...box()
  // })


  setHandler('resize', ({width, height}: {width: number, height: number} = {width: 100, height: 100}) => {
    const aspectRatioVec = calcAspectRatioVec(width, height)
    // const aspectRatio = width / height
    // const aspectRatioVec = aspectRatio > 1 ? [aspectRatio, 1] : [1, 1 / aspectRatio]
    program2.set({u_aspectRatio: aspectRatioVec})
  })

  // setHandler('mouse', ({x, y}: {x: number, y: number} = {x: 0, y: 0}) => {
  //   program1.set({u_mouse: [x, y]})
  // })

  const animation = new Loop({callback: () => {
    renderer.clear()
    renderer.render(vao, program2)
  }})

  animation.start()
}

//----------------------------------------------------------------

const plane = (core: Core) => new Vao(core, {
  id        : 'plane',
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