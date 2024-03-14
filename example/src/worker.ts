import {Program, Renderer, Vao} from '../../src'
import {Core} from '../../src/Core'

console.log('Starting worker')
let count = 0

onmessage = async({data}) => {
  const {init, state} = data
  if (init) {
    const core = new Core({canvas: init})

    const simple = {

      vert : /* glsl */`#version 300 es
      layout(location = 0) in vec3 a_position;
      void main(void){
        gl_Position = vec4(a_position, 1.0);
      }`,

      frag: /* glsl */`#version 300 es
      precision highp float;
      out vec4 outColor;
      void main(void){
        outColor = vec4(vec3(.0,.0,.5), 1.);
      }`

    }
    const simpleP = new Program(core, simple)


    const plane = {
      attributes: {
        a_position: [
          -1.0, 1.0, 0.0,
          1.0, 1.0, 0.0,
          -1.0, -1.0, 0.0,
          1.0, -1.0, 0.0
        ],
      },
      index: [
        2, 1, 0,
        1, 2, 3
      ]
    }
    const planeVAO = new Vao(core, plane)
    const renderer = new Renderer(core)
    renderer.render(planeVAO, simpleP)
  }
  if (state) {
    count += data.state
    self.postMessage(count)
  }
}


export default {}