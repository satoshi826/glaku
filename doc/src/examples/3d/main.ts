import {Camera, Core, Loop, Model, Program, Renderer, Vao, box, setHandler} from '../../../../src'

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
  const core = new Core({
    canvas,
    resizeListener: (fn) => setHandler('resize', fn),
    options       : ['DEPTH_TEST', 'CULL_FACE']
  })
  const renderer = new Renderer(core, {
    backgroundColor: [0.1, 0.1, 0.1, 1.0]
  })

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
      u_lightPosition : 'vec3', // PointLight
      u_cameraPosition: 'vec3'
    },
    vert: /* glsl */ `
        out vec3 v_position;
        out vec3 v_normal;
        void main() {
          vec4 position_4 = vec4(a_position, 1.0);
          v_position = (u_mMatrix * position_4).xyz;
          v_normal = (u_mMatrix * vec4(a_normal, 1.0)).xyz;
          mat4 mvpMatrix = u_vpMatrix * u_mMatrix; // Model View Projection
          gl_Position = mvpMatrix * position_4;
        }`,
    frag: /* glsl */`
        in vec3 v_position;
        in vec3 v_normal;
        out vec4 o_color;
        void main() {
          vec3 viewDir = normalize(u_cameraPosition - v_position);
          vec3 lightDir = normalize(u_lightPosition - v_position);
          vec3 reflectDir = reflect(-lightDir, v_normal);
          float ambient = 0.05;
          float diffuse = max(0.0, dot(lightDir, v_normal));
          float specular = pow(max(0.0, dot(viewDir, reflectDir)), 20.0);
          vec3 color = vec3(0.5, 0.8, 1.0);
          vec3 result = (ambient + diffuse + specular) * color;
          o_color = vec4(result, 1.0);
        }`
  })

  setHandler('resize', ({width, height}: {width: number, height: number} = {width: 100, height: 100}) => {
    camera.aspect = width / height
    camera.update()
    program.set({u_vpMatrix: camera.matrix.vp})
  })

  program.set({
    u_lightPosition : [1, 2, 1],
    u_cameraPosition: camera.position
  })

  const animation = new Loop({callback: ({elapsed}) => {
    renderer.clear()
    model.rotation.angle = elapsed / 800
    model.update()
    program.set({u_mMatrix: model.matrix.m})
    renderer.render(vao, program)
  }})

  animation.start()
}

//----------------------------------------------------------------