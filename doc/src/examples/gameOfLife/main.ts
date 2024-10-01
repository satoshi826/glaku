import {Core, Loop, Program, RGBA8, Renderer, Vao, calcAspectRatioVec, plane2D} from 'glaku'
import {mouseState, resizeState} from '../state'

class PingPong {
  read
  write
  constructor(core: Core) {
    this.read = new Renderer(core, {frameBuffer: [RGBA8]})
    this.write = new Renderer(core, {frameBuffer: [RGBA8]})
  }
  swap() {
    [this.read, this.write] = [this.write, this.read]
  }
}

export const main = async(canvas: HTMLCanvasElement | OffscreenCanvas) => {

  const core = new Core({canvas, resizeListener: (fn) => resizeState.on(fn)})
  const updateRenderers = new PingPong(core)
  const renderer = new Renderer(core)
  const vao = new Vao(core, plane2D())

  const w = 200
  const h = 200
  const initTexture = core.createTexture({
    array : new Float32Array([...Array(w * h * 4)].map(() => Math.random())),
    width : w,
    height: h
  })

  const updateProgram = new Program(core, {
    id            : 'update',
    attributeTypes: {a_position: 'vec2'},
    uniformTypes  : {
      u_resolution: 'vec2',
      u_mouse     : 'vec2'
    },
    texture: {t_before: initTexture},
    vert   : /* glsl */ `
      void main() {
        gl_Position = vec4(a_position, 1.0, 1.0);
    }`,
    frag: /* glsl */`
        out vec4 o_color;

        bool cellExists(vec2 coord, vec2 scale) {return texture(t_before, (gl_FragCoord.xy + coord) * scale).g > 0.5;}

        const vec2[8] neighborVec = vec2[](
          vec2(-1.0, 1.0), vec2(0.0, 1.0), vec2(1.0, 1.0),
          vec2(-1.0, 0.0),                 vec2(1.0, 0.0),
          vec2(-1.0, -1.0), vec2(0.0, -1.0), vec2(1.0, -1.0)
        );

        void main() {
          vec2 scale = 1.0 / u_resolution;
          bool alive = cellExists(vec2(0.0, 0.0), scale);
          int neighbors = 0;
          for (int i = 0; i < 8; i++) {
            neighbors += (cellExists(neighborVec[i], scale) ? 1 : 0);
          }

          vec2 currentPoint = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
          bool feed = length(currentPoint - u_mouse) < 0.1;
          neighbors += (feed ? 1 : 0);

          bool stillAlive = alive && (neighbors == 2 || neighbors == 3);
          bool born = !alive && neighbors == 3;

          o_color = (stillAlive || born) ? vec4(0.0, 1.0, 0.0, 1.0) : vec4(0.0, 0.0, 0.0, 1.0);
        }`
  })

  const renderProgram = new Program(core, {
    id            : 'render',
    attributeTypes: {
      a_position    : 'vec2',
      a_textureCoord: 'vec2'
    },
    texture: {t_result: null},
    vert   : /* glsl */ `
    out vec2 v_uv;
      void main() {
        vec2 pos = a_position;
        v_uv = a_textureCoord;
        gl_Position = vec4(pos, 1.0, 1.0);
    }`,
    frag: /* glsl */`
        in vec2 v_uv;
        out vec4 o_color;
        void main() {
          o_color = texture(t_result, v_uv);
        }`
  })

  const setResolution = (w: number, h: number) => updateProgram.setUniform({u_resolution: [Math.trunc(w), Math.trunc(h)]})
  setResolution(updateRenderers.read!.width, updateRenderers.read!.height)

  resizeState.on(({width, height}) => {
    if (!width || !height) return
    setResolution(width, height)
  })

  mouseState.on(({x, y}) => {
    const [a, b] = calcAspectRatioVec(updateRenderers.read.width, updateRenderers.read.height)
    updateProgram.setUniform({u_mouse: [a * x, b * y]})
  })

  let init = true
  const animation = new Loop({callback: () => {
    if (init) init = false
    else updateProgram.setTexture({t_before: updateRenderers.read.renderTexture[0]})
    updateRenderers.write.render(vao, updateProgram)
    updateRenderers.swap()
    renderProgram.setTexture({t_result: updateRenderers.read.renderTexture[0]})
    renderer.render(vao, renderProgram)
  }})
  animation.start()
}