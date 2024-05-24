import {Camera, Core, Loop, Model, Program, Renderer, Vao, box, setHandler, plane} from 'glaku'
import {random, range} from 'jittoku'

const CUBE_NUM = 11000

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas, pixelRatio: number) => {
  const core = new Core({
    canvas,
    pixelRatio,
    resizeListener: (fn) => setHandler('resize', fn),
    options       : ['DEPTH_TEST', 'CULL_FACE']
  })
  const renderer = new Renderer(core, {backgroundColor: [0.2, 0.2, 0.25, 1.0]})

  const boxVao = new Vao(core, {
    id                 : 'box',
    instancedAttributes: ['a_mMatrix'],
    maxInstance        : CUBE_NUM,
    ...box()
  })
  const models = range(CUBE_NUM).map(() => {
    let zScale = random(5, 100)
    zScale = zScale > 99.5 ? 1.75 * zScale : zScale
    return new Model({
      position: [random(-5000, 5000), zScale, random(-5000, 5000)],
      scale   : [random(10, 50), zScale, random(10, 50)]
    })
  })

  const planeVao = new Vao(core, {
    id                 : 'box',
    instancedAttributes: ['a_mMatrix'],
    maxInstance        : CUBE_NUM,
    ...plane()
  })

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
          mat3 normalMatrix = transpose(inverse(mat3(a_mMatrix)));
          v_normal = normalize(normalMatrix * a_normal);
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
          vec3 color = vec3(0.5);
          vec3 result = (ambient + diffuse + specular) * color;
          o_color = vec4(result, 1.0);
        }`
  })
  boxVao.setInstancedValues({a_mMatrix: models.flatMap(({matrix: {m}}) => m)})

  const camera = new Camera({lookAt: [0, 100, 0], position: [0, 200, 0], far: 10000, fov: 70})

  setHandler('resize', ({width, height}: {width: number, height: number} = {width: 100, height: 100}) => {
    camera.aspect = width / height
    camera.update()
    program.set({u_vpMatrix: camera.matrix.vp})
  })

  setHandler('pixelRatio', (pixelRatio: number = 1) => {
    renderer.resize({pixelRatio})
  })

  program.set({u_lightPosition: [1000, 300, 1000]})

  const animation = new Loop({callback: ({elapsed}) => {
    renderer.clear()

    camera.position = [2000 * Math.cos(elapsed / 3000), 400, 2000 * Math.sin(elapsed / 3000)]
    camera.update()
    program.set({
      u_vpMatrix      : camera.matrix.vp,
      u_cameraPosition: camera.position
    })

    renderer.render(boxVao, program)
  }, interval: 0})

  animation.start()
}