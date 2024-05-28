import {Camera, Loop, Model, Vao, box, setHandler, plane, RGBA32F, DEPTH, Program, RGBA16F, RGBA8, Core, Renderer} from 'glaku'
import {random, range} from 'jittoku'

const CUBE_NUM = 11000

const models = range(CUBE_NUM).map(() => {
  let zScale = random(10, 100)
  zScale = zScale > 99.5 ? 1.75 * zScale : zScale
  return new Model({
    position: [random(-5000, 5000), zScale, random(-5000, 5000)],
    scale   : [random(10, 50), zScale, random(10, 50)]
  })
})

const camera = new Camera({lookAt: [0, 100, 0], position: [0, 200, 0], far: 8000, fov: 60})

export const main = async(canvas: HTMLCanvasElement | OffscreenCanvas, pixelRatio: number) => {
  const core = new Core({
    canvas,
    pixelRatio,
    resizeListener: (fn) => setHandler('resize', fn),
    options       : ['DEPTH_TEST', 'CULL_FACE']
  })

  const planeVao = new Vao(core, {
    id: 'plane',
    ...plane()
  })

  const textureRenderer = new Renderer(core, {frameBuffer: [RGBA8], width: 100, height: 100})
  const preRenderer = new Renderer(core, {frameBuffer: [RGBA32F, RGBA32F, RGBA32F]})
  const renderer = new Renderer(core, {backgroundColor: [0.2, 0.2, 0.25, 1.0]})

  const boxVao = new Vao(core, {
    id                 : 'box',
    instancedAttributes: ['a_mMatrix'],
    maxInstance        : CUBE_NUM,
    ...box()
  })

  const textureProgram = new Program(core, {
    id            : 'tex',
    // id            : 'compose',
    attributeTypes: {
      a_position    : 'vec3',
      a_textureCoord: 'vec2'
    },
    vert: /* glsl */ `
        out float y;
        out float x;
        void main() {
          x = a_position.x;
          y = a_position.y;
          gl_Position = vec4(a_position, 1.0);
        }`,
    frag: /* glsl */`
        in float x;
        in float y;
        out vec4 o_color;
        void main() {
          o_color = vec4(step(cos(2.0*y), 0.0) + step(cos(2.0*x), 0.0));
          // o_color = vec4(0.5);
        }`
  })

  await new Promise((resolve) => {
    requestAnimationFrame(() => {
      textureRenderer.render(planeVao, textureProgram)
      resolve(null)
    })
  })

  const prepassProgram = new Program(core, {
    id            : '3d',
    attributeTypes: {
      a_position    : 'vec3',
      a_normal      : 'vec3',
      a_textureCoord: 'vec2',
      a_mMatrix     : 'mat4'
    },
    uniformTypes: {
      u_vpMatrix: 'mat4'
    },
    texture: {
      t_buildingTexture: textureRenderer.renderTexture[0]
    },
    vert: /* glsl */ `
        out vec4 v_position;
        out vec4 v_normal;
        out float y;
        out float x;
        out vec2 v_uv;
        void main() {
          vec4 position = vec4(a_position, 1.0);
          v_position = vec4((a_mMatrix * position).xyz, 1.0);
          mat3 normalMatrix = transpose(inverse(mat3(a_mMatrix)));
          v_normal = vec4(a_normal, 1.0);
          x = a_position.x;
          y = a_position.y;
          v_uv  = a_textureCoord * 2.0;
          mat4 mvpMatrix = u_vpMatrix * a_mMatrix;
          gl_Position = mvpMatrix * position;
        }`,
    frag: /* glsl */`
        in vec4 v_position;
        in vec4 v_normal;
        in float x;
        in float y;
        in vec2 v_uv;
        layout (location = 0) out vec4 o_position;
        layout (location = 1) out vec4 o_normal;
        layout (location = 2) out vec4 o_color;
        void main() {
          vec3 window = texture(t_buildingTexture, v_uv).xyz;
          o_position = v_position;
          o_normal = v_normal;
          o_color = vec4(window, 1.0);
        }`
  })

  const composeProgram = new Program(core, {
    id            : 'compose',
    attributeTypes: {
      a_position    : 'vec3',
      a_textureCoord: 'vec2'
    },
    texture: {
      t_positionTexture: preRenderer.renderTexture[0],
      t_normalTexture  : preRenderer.renderTexture[1],
      t_colorTexture   : preRenderer.renderTexture[2]
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
          vec3 color = texture(t_colorTexture, v_uv).rgb;

          if (position == vec3(0.0)) {
            discard;
          }

          vec3 viewVec = normalize(u_cameraPosition - position);
          vec3 lightVec = normalize(u_lightPosition - position);
          vec3 reflectVec = reflect(-lightVec, normal);
          float ambient = 0.1;
          float diffuse = max(0.0, dot(lightVec, normal));
          float specular = pow(max(0.0, dot(viewVec, reflectVec)), 40.0);
          vec3 result = (ambient + diffuse + specular) * color;
          // vec3 result = 0.5 * color;

          o_color = vec4(result, 1.0);
        }`
  })
  boxVao.setInstancedValues({a_mMatrix: models.flatMap(({matrix: {m}}) => m)})

  setHandler('resize', ({width, height}: {width: number, height: number} = {width: 100, height: 100}) => {
    camera.aspect = width / height
    camera.update()
    prepassProgram.set({u_vpMatrix: camera.matrix.vp})
  })

  composeProgram.set({u_lightPosition: [2000, 400, 8000]})

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