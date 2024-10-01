import {Camera, Core, Loop, Model, Program, Renderer, Vao, box} from 'glaku'
import {mouseState, resizeState} from '../state'

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
  const core = new Core({
    canvas,
    resizeListener: (fn) => resizeState.on(fn),
    options       : ['DEPTH_TEST', 'CULL_FACE'] // gl.enable(gl.DEPTH_TEST) && gl.enable(gl.CULL_FACE)
  })
  const renderer = new Renderer(core, {backgroundColor: [0.1, 0.1, 0.1, 1.0]})

  const vao = new Vao(core, {
    id: 'box',
    ...box()
  })

  const model = new Model({rotation: {axis: [0, 1, 0], angle: 0}})
  const camera = new Camera({position: [0, 2, 4]})
  const program = new Program(core, {
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
        out vec3 v_position;
        out vec3 v_normal;
        void main() {
          vec4 position = vec4(a_position, 1.0);
          v_position = (u_mMatrix * position).xyz;
          mat3 normalMatrix = transpose(inverse(mat3(u_mMatrix)));
          v_normal = normalize(normalMatrix * a_normal);
          mat4 mvpMatrix = u_vpMatrix * u_mMatrix;
          gl_Position = mvpMatrix * position;
        }`,
    frag: /* glsl */`
        in vec3 v_position;
        in vec3 v_normal;
        out vec4 o_color;
        void main() {
          vec3 viewVec = normalize(u_cameraPosition - v_position);
          vec3 lightVec = normalize(u_lightPosition - v_position);
          vec3 reflectVec = reflect(-lightVec, v_normal);
          float ambient = 0.1;
          float diffuse = max(0.0, dot(lightVec, v_normal));
          float specular = pow(max(0.0, dot(viewVec, reflectVec)), 40.0);
          vec3 color = vec3(0.5, 0.8, 1.0);
          vec3 result = (ambient + diffuse + specular) * color;
          o_color = vec4(result, 1.0);
        }`
  })

  resizeState.on(({width, height}) => {
    camera.aspect = width / height
    camera.update()
    program.setUniform({u_vpMatrix: camera.matrix.vp})
  })

  mouseState.on(({x, y}) => {
    program.setUniform({u_lightPosition: [5 * x, 5 * y, 2]})
  })

  program.setUniform({
    u_lightPosition : [2, 2, 2],
    u_cameraPosition: camera.position
  })

  const animation = new Loop({callback: ({elapsed}) => {
    renderer.clear()
    model.rotation.angle = elapsed / 800
    model.update()
    program.setUniform({u_mMatrix: model.matrix.m})
    renderer.render(vao, program)
  }})

  animation.start()
}

//----------------------------------------------------------------