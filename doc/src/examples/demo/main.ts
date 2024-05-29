import {Camera, Loop, Model, Vao, box, setHandler, plane, RGBA32F, DEPTH, Program, RGBA16F, RGBA8, Core, Renderer, TextureType} from 'glaku'
import {random, range} from 'jittoku'

const CUBE_NUM = 11000
const MAX_HEIGHT = 200

const MAX_HEIGHT_INVERSE = 1 / 200

const models = range(CUBE_NUM).map(() => {
  let zScale = random(10, MAX_HEIGHT * 0.5)
  zScale = zScale > MAX_HEIGHT * 0.5 * 0.99 ? zScale + random(0, 100) : zScale
  return new Model({
    position: [random(-5000, 5000), zScale, random(-5000, 5000)],
    scale   : [random(10, 50), zScale, random(10, 50)]
  })
})

const camera = new Camera({lookAt: [0, 100, 0], position: [0, 200, 0], near: 100, far: 8000, fov: 60})

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

  // const textureRenderer = new Renderer(core, {frameBuffer: [RGBA8], width: 100, height: 100})
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
        out vec3 pos;
        void main() {
          x = a_position.x;
          y = a_position.y;
          pos = a_position;
          gl_Position = vec4(a_position, 1.0);
        }`,
    frag: /* glsl */`
        in float x;
        in float y;
        in vec3 pos;
        out vec4 o_color;
        void main() {
          float window = 0.6 * step(abs(x), 0.5) * step(abs(y), 0.5) + 0.2;
          o_color = vec4(window);
        }`
  })

  // await new Promise((resolve) => {
  //   requestAnimationFrame(() => {
  //     textureRenderer.render(planeVao, textureProgram)
  //     resolve(null)
  //   })
  // })

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
    // texture: {
    //   t_buildingTexture: textureRenderer.renderTexture[0]
    // },
    vert: /* glsl */ `
        out vec4 v_position;
        out vec4 v_normal;
        out vec3  v_pos_local;
        out vec2 v_uv;
        void main() {
          vec4 position = vec4(a_position, 1.0);
          v_position = vec4((a_mMatrix * position).xyz, 1.0);
          mat3 normalMatrix = transpose(inverse(mat3(a_mMatrix)));
          v_normal = vec4(a_normal, 1.0);
          v_pos_local = vec3(a_mMatrix[0][0], a_mMatrix[1][1], a_mMatrix[2][2]) * a_position * ${MAX_HEIGHT_INVERSE};
          v_uv  = a_textureCoord * 10.0;
          mat4 mvpMatrix = u_vpMatrix * a_mMatrix;
          gl_Position = mvpMatrix * position;
        }`,
    frag: /* glsl */`
        in vec4 v_position;
        in vec4 v_normal;
        in vec3 v_pos_local;
        in vec2 v_uv;
        layout (location = 0) out vec4 o_position;
        layout (location = 1) out vec4 o_normal;
        layout (location = 2) out vec4 o_color;
        void main() {
          o_position = v_position;
          o_normal = v_normal;
          o_color = vec4(v_pos_local, 1.0);
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

          vec3 w = texture(t_colorTexture, v_uv).xyz;
          // float window = step(0.4, fract(10.0 * w.x)) + step(0.4, fract(10.0 * w.y)) + step(0.4, fract(10.0 * w.z));
          float tmp = step(0.5, fract(5.0 * w.x)) + step(0.5, fract(5.0 * w.y)) + step(0.5, fract(5.0 * w.z));
          float window1 = 1.0 - tmp;
          float window2 = 3.0 * tmp - 6.0;
          float window = step(0.5, window1) + step(0.5, window2);
          // float window = 2.0 * tmp - 6.0;
          // float window = 0.6 * step(cos(w.x*100.0), 0.4) * step(cos(w.y*100.0), 0.4) + 0.2;
          // float window = 0.6 * cos(w.x*50.0) * cos(w.y*50.0) + 0.2;


          if (position == vec3(0.0)) {
            discard;
          }

          vec3 viewVec = normalize(u_cameraPosition - position);
          vec3 lightVec = normalize(u_lightPosition - position);
          vec3 reflectVec = reflect(-lightVec, normal);
          float ambient = 0.1;
          float diffuse = max(0.0, dot(lightVec, normal));
          float specular = pow(max(0.0, dot(viewVec, reflectVec)), 40.0);
          // vec3 result = (ambient + diffuse + specular) * color;
          // vec3 result = color;
          vec3 result = vec3(window);
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