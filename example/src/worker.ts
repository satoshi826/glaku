import {Loop, Program, Renderer, Vao, setHandler, setState} from '../../src'
import {Core} from '../../src/Core'

console.log('starting worker')

onmessage = async({data}) => {
  const {init, mouse, resize} = data

  if (init) {
    const core = new Core({canvas: init, resizeListener: (fn) => setHandler('resize', fn)})
    const simpleP = new Program(core, sample)
    const planeVAO = new Vao(core, plane)
    const renderer = new Renderer(core)

    setHandler('mouse', (v) => {
      if (v) {
        const {x, y} = v as { x: number, y: number}
        simpleP.set({
          u_mouse: [x, y]
        })
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

  id: 'sample',

  uniformTypes: {
    u_resolution: 'vec2',
    u_mouse     : 'vec2',
    u_unix      : 'int'
  },

  attributeTypes: {
    a_position: 'vec3'
  },

  vert: /* glsl */`#version 300 es
    in vec3 a_position;
    void main(void){
      gl_Position = vec4(a_position, 1.0);
    }
  `,

  frag: /* glsl */`#version 300 es
    precision highp float;
    uniform   vec2  u_mouse;
    uniform   vec2  u_resolution;
    uniform   int  u_unix;
    out vec4 outColor;

    void main(void){
      vec2 currentPoint = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
      float l = .5*(sin(float(u_unix)/500.) + 2.) * (1.-length(currentPoint-u_mouse));
      outColor = vec4(vec3(l), 1.);
  }
  `
} as const

const gpgpu = {

  id: 'gpgpu',

  vert: /* glsl */`#version 300 es
    layout(location = 0) in vec3 a_position;
    void main(void){
      gl_Position = vec4(a_position, 1.0);
    }
  `,

  frag: /* glsl */`#version 300 es
    precision highp float;
    uniform   vec2  u_mouse;
    uniform   vec2  u_resolution;
    uniform   int  u_unix;
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

export default {}