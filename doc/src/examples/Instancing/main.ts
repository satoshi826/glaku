import {Camera, Core, Loop, Model, Program, Renderer, Vao, box, setHandler, normalize, getState} from 'glaku'
import {random, range} from 'jittoku'

const CUBE_NUM = 3000

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
  const core = new Core({
    canvas,
    resizeListener: (fn) => setHandler('resize', fn),
    pixelRatio    : getState('pixelRatio') as number,
    options       : ['DEPTH_TEST', 'CULL_FACE']
  })
  const renderer = new Renderer(core, {backgroundColor: [0.2, 0.2, 0.25, 1.0]})

  const vao = new Vao(core, {
    id                 : 'box',
    instancedAttributes: ['a_mMatrix'],
    maxInstance        : CUBE_NUM,
    ...box()
  })

  const models = range(CUBE_NUM).map(() => {
    return new Model({
      position: [random(-60, 60), random(-25, 25), random(-60, 60)],
      rotation: {axis: normalize([random(-1, 1), random(-1, 1), random(-1, 1)]), angle: 0}
    })
  })

  const camera = new Camera({lookAt: [0, 0, 0], far: 200})

  const program = new Program(core, {
    id            : '3d',
    attributeTypes: {
      a_position: 'vec3',
      a_normal  : 'vec3',
      a_mMatrix : 'mat4'
    },
    uniformTypes: {
      u_vpMatrix      : 'mat4',
      u_lightPosition : 'vec3',
      u_cameraPosition: 'vec3'
    },
    vert: /* glsl */ `
        out vec3 v_position;
        out vec3 v_normal;
        void main() {
          vec4 position = vec4(a_position, 1.0);
          v_position = (a_mMatrix * position).xyz;
          v_normal = (a_mMatrix * vec4(a_normal, 0.0)).xyz;
          mat4 mvpMatrix = u_vpMatrix * a_mMatrix;
          gl_Position = mvpMatrix * position;
        }`,
    frag: /* glsl */`
        in vec3 v_position;
        in vec3 v_normal;
        out vec4 o_color;
        void main() {
          vec3 normal = normalize(v_normal);
          vec3 viewVec = normalize(u_cameraPosition - v_position);
          vec3 lightVec = normalize(u_lightPosition - v_position);
          vec3 reflectVec = reflect(-lightVec, v_normal);
          float ambient = 0.1;
          float diffuse = max(0.0, dot(lightVec, v_normal));
          float specular = pow(max(0.0, dot(viewVec, reflectVec)), 40.0);
          vec3 color = vec3(0.6, 0.6, 0.7);
          vec3 result = (ambient + diffuse + specular) * color;
          o_color = vec4(result, 1.0);
        }`
  })
  vao.setInstancedValues({a_mMatrix: models.map(({matrix: {m}}) => m).flat()})

  setHandler('resize', ({width, height}: {width: number, height: number} = {width: 100, height: 100}) => {
    camera.aspect = width / height
    camera.update()
    program.set({u_vpMatrix: camera.matrix.vp})
  })

  program.set({
    u_lightPosition: [100, 0, 0]
  })

  const animation = new Loop({callback: ({elapsed}) => {
    renderer.clear()

    camera.position = [60 * Math.cos(elapsed / 4000), 10, 60 * Math.sin(elapsed / 4000)]
    camera.update()
    program.set({
      u_vpMatrix      : camera.matrix.vp,
      u_cameraPosition: camera.position
    })

    models.forEach(model => {
      model.rotation.angle = elapsed / 600
      model.update()
    })
    vao.setInstancedValues({a_mMatrix: models.map(({matrix: {m}}) => m).flat()})

    renderer.render(vao, program)
  }, interval: 0})

  animation.start()
}