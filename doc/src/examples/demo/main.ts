import {Camera, Loop, Model, Vao, box, setHandler, plane, RGBA32F, Core, DEPTH, Program, Renderer} from 'glaku'
import {random, range} from 'jittoku'

const CUBE_NUM = 11000

const models = range(CUBE_NUM).map(() => {
  let zScale = random(5, 100)
  zScale = zScale > 99.5 ? 1.75 * zScale : zScale
  return new Model({
    position: [random(-5000, 5000), zScale, random(-5000, 5000)],
    scale   : [random(10, 50), zScale, random(10, 50)]
  })
})

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas, pixelRatio: number) => {
  const core = new Core({
    canvas,
    pixelRatio,
    resizeListener: (fn) => setHandler('resize', fn),
    options       : ['DEPTH_TEST', 'CULL_FACE']
  })

  const preRenderer = new Renderer(core, {frameBuffer: [RGBA32F, RGBA32F, DEPTH]})
  const renderer = new Renderer(core, {backgroundColor: [0.2, 0.2, 0.25, 1.0]})

  const boxVao = new Vao(core, {
    id                 : 'box',
    instancedAttributes: ['a_mMatrix'],
    maxInstance        : CUBE_NUM,
    ...box()
  })

  const prepassProgram = new Program(core, {
    id            : '3d',
    attributeTypes: {
      a_position: 'vec3',
      a_normal  : 'vec3',
      a_mMatrix : 'mat4'
    },
    uniformTypes: {
      u_vpMatrix: 'mat4'
    },
    vert: /* glsl */ `
        out vec3 v_position;
        out vec3 v_normal;
        out vec3 v_a_position;
        void main() {
          vec4 position = vec4(a_position, 1.0);
          v_position = (a_mMatrix * position).xyz;
          mat3 normalMatrix = transpose(inverse(mat3(a_mMatrix)));
          v_normal = a_normal;
          mat4 mvpMatrix = u_vpMatrix * a_mMatrix;
          gl_Position = mvpMatrix * position;
        }`,
    frag: /* glsl */`
        float noise(vec3 p) {
          return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        }
        in vec3 v_position;
        in vec3 v_a_position;
        in vec3 v_normal;
        layout (location = 1) out vec3 o_position;
        layout (location = 0) out vec3 o_normal;
        void main() {
          o_position = v_position;

          float noiseScale = 10.0;
          vec3 noisePos = v_position * noiseScale;
          float noiseValue = noise(noisePos);
          float a = 1.0 * step(-cos(10.0*v_a_position.y), 0.0);
          o_normal = v_normal * a;
        }`
  })

  const planeVao = new Vao(core, {
    id: 'plane',
    ...plane()
  })
  const composeProgram = new Program(core, {
    id            : 'compose',
    attributeTypes: {
      a_position    : 'vec3',
      a_textureCoord: 'vec2'
    },
    texture: {
      t_normalTexture  : preRenderer.renderTexture[0],
      t_positionTexture: preRenderer.renderTexture[1]
    },
    uniformTypes: {
      u_lightPosition : 'vec3',
      u_cameraPosition: 'vec3'
    },
    vert: /* glsl */ `
        out vec2 v_uv;
        void main() {
          v_uv  = a_textureCoord;
          gl_Position = vec4(a_position, 1.0);
        }`,
    frag: /* glsl */`
        in vec2 v_uv;
        out vec4 o_color;
        void main() {

          vec3 position = texture(t_positionTexture, v_uv).xyz;
          vec3 normal = texture(t_normalTexture, v_uv).xyz;
          if (position == vec3(0.0)) {
            discard;
          }

          vec3 viewVec = normalize(u_cameraPosition - position);
          vec3 lightVec = normalize(u_lightPosition - position);
          vec3 reflectVec = reflect(-lightVec, normal);
          float ambient = 0.1;
          float diffuse = max(0.0, dot(lightVec, normal));
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
    prepassProgram.set({u_vpMatrix: camera.matrix.vp})
  })

  composeProgram.set({u_lightPosition: [1000, 300, 1000]})

  const animation = new Loop({callback: ({elapsed}) => {
    renderer.clear()
    preRenderer.clear()

    camera.position = [2000 * Math.cos(elapsed / 3000), 400, 2000 * Math.sin(elapsed / 3000)]
    camera.update()
    prepassProgram.set({u_vpMatrix: camera.matrix.vp})
    composeProgram.set({u_cameraPosition: camera.position})

    preRenderer.render(boxVao, prepassProgram)
    renderer.render(planeVao, composeProgram)

  }, interval: 0})

  animation.start()
}

//----------------------------------------------------------------