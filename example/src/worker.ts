import {Loop, Program, Renderer, Vao, setHandler, setState} from '../../src'
import {Core} from '../../src/Core'
import {GPGPU} from '../../src/GPGPU'

console.log('starting worker')

onmessage = async({data}) => {
  const {init, mouse, resize} = data

  if (init) {
    const core = new Core({canvas: init, resizeListener: (fn) => setHandler('resize', fn)})
    const simpleP = new Program(core, sample)
    const planeVAO = new Vao(core, plane)
    const renderer = new Renderer(core)

    const gpgpu = new GPGPU(core, {
      id            : 'gpgpu',
      attributeTypes: {a_vecA: 'vec4', a_vecB: 'vec4'},
      attributes    : {
        a_vecA: [1, 2, 3, 4],
        a_vecB: [4, 5, 6, 7]
      },
      transformFeedback: {o_result: 'vec4'},
      vert             : /* glsl */ `
        void main() {
          o_result = a_vecA + a_vecB;
        }`
    })

    setHandler('mouse', (v) => {
      if (v) {
        const {x, y} = v as { x: number, y: number}
        simpleP.set({u_mouse: [x, y]})
      }
    })

    const animation = new Loop({callback: ({unix}) => {
      simpleP.set({u_unix: unix})
      renderer.clear()
      renderer.render(planeVAO, simpleP)
    }})

    animation.start()
    setInterval(() => self.postMessage({drawTime: animation.drawTime.toFixed(2) + ' ms', fps: (1000 / animation.delta).toFixed(2)}), 200)

  }

  if (mouse) setState({mouse})
  if (resize) setState({resize})

}

//----------------------------------------------------------------

const sample = {
  id            : 'sample',
  attributeTypes: {
    a_position: 'vec3'
  },
  uniformTypes: {
    u_resolution: 'vec2',
    u_mouse     : 'vec2',
    u_unix      : 'int'
  },
  vert: /* glsl */`
    void main(void){gl_Position = vec4(a_position, 1.0);}
  `,
  frag: /* glsl */`
    out vec4 outColor;
    void main(void){
      vec2 currentPoint = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
      float l = .5*(sin(float(u_unix)/500.) + 2.) * (1.-length(currentPoint-u_mouse));
      outColor = vec4(vec3(l), 1.);
  }
  `
} as const

const plane = {
  attributes: {
    a_position: [
      -1.0, 1.0, 0.0,
      1.0, 1.0, 0.0,
      -1.0, -1.0, 0.0,
      1.0, -1.0, 0.0
    ]
  },
  index: [
    2, 1, 0,
    1, 2, 3
  ]
}