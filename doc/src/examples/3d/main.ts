import {Camera, Core, Loop, Model, Program, Renderer, Vao, box, setHandler} from '../../../../src'

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
  const core = new Core({canvas, resizeListener: (fn) => setHandler('resize', fn)})
  const renderer = new Renderer(core)

  const boxVao = new Vao(core, {
    id: 'box',
    ...box()
  })

  const model = new Model({rotation: {axis: [0, 1, 0], angle: 0}})
  const camera = new Camera({position: [0, 0, 5]})

  const program = new Program(core, { // Model View Projection
    id            : '3d',
    attributeTypes: {
      a_position: 'vec3',
      a_normal  : 'vec3'
    },
    uniformTypes: {
      u_mMatrix       : 'mat4',
      u_vpMatrix      : 'mat4',
      u_lightPosition : 'vec3',
      u_cameraPosition: 'vec3'
    },
    vert: /* glsl */ `
        out vec3 o_position;
        out vec3 o_normal;
        void main() {
          o_position = (u_mMatrix * vec4(a_position, 1.0)).xyz;
          o_normal = a_normal;
          mat4 mvpMatrix = u_vpMatrix * u_mMatrix;
          vec4 localPosition = mvpMatrix * vec4(a_position, 1.0);
          gl_Position =  localPosition;
        }`,
    frag: /* glsl */`
        in vec3 o_position;
        in vec3 o_normal;
        out vec4 o_color;
        void main() {
          vec3 viewDir = normalize(u_cameraPosition - o_position);
          vec3 lightDir = normalize(u_lightPosition - o_position);
          float lightDis = distance(u_lightPosition, o_position);
          vec3 diffuse = vec3(0.0);
          vec3 specular = vec3(0.0);
          o_color = vec4(vec3(0.5), 1.0);
        }`
  })

  setHandler('resize', ({width, height}: {width: number, height: number} = {width: 100, height: 100}) => {
    camera.aspect = width / height
    camera.update()
    program.set({u_vpMatrix: camera.matrix.vp})
  })

  program.set({
    u_lightPosition : [0, 0, 1],
    u_cameraPosition: camera.position
  })

  const animation = new Loop({callback: ({elapsed}) => {
    renderer.clear()
    model.rotation.angle = elapsed / 400
    model.update()
    program.set({u_mMatrix: model.matrix.m})
    renderer.render(boxVao, program)
  }})

  animation.start()
}

//----------------------------------------------------------------