import {Vao, Program, Renderer, Core, Loop, RGBA32F, plane2D} from 'glaku'
import {mouseState, resizeState} from '../state'

class PingPong {
  read
  write
  constructor(core: Core) {
    this.read = new Renderer(core, {frameBuffer: [RGBA32F], pixelRatio: 0.125})
    this.write = new Renderer(core, {frameBuffer: [RGBA32F], pixelRatio: 0.125})
  }
  swap() {
    [this.read, this.write] = [this.write, this.read]
  }
}

export const main = (canvas: OffscreenCanvas, pixelRatio: number) => {
  const core = new Core({
    canvas,
    pixelRatio,
    resizeListener: (resizeHandler) => resizeState.on(resizeHandler)
  })

  const waveRenderers = new PingPong(core)
  const renderer = new Renderer(core)
  const planeVAO = new Vao(core, plane2D())

  const waveProgram = new Program(core, {
    attributeTypes: {
      a_position    : 'vec2',
      a_textureCoord: 'vec2'
    },
    uniformTypes: {
      u_resolution: 'vec2',
      u_mouse     : 'vec2'
    },
    texture: {
      t_preWave: null
    },
    vert: /* glsl */ `
    out vec2 v_uv;
    void main() {
      v_uv = a_textureCoord;
      gl_Position = vec4(a_position, 1.0, 1.0);
    }`,
    frag: /* glsl */ `
        in vec2 v_uv;
        out vec4 o_wave;
        vec4 fetch(vec2 coord, vec2 scale) {return texture(t_preWave, vec2(v_uv + coord * scale));}
        void main() {
          vec2 scale = 1.0 / u_resolution;

          vec2 aspectRatio = u_resolution / min(u_resolution.x, u_resolution.y);
          vec2 currentPoint = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
          vec2 mouseVec = currentPoint - u_mouse * aspectRatio;

          float currentPos = fetch(vec2(0.0, 0.0), scale).r;
          float currentVel = fetch(vec2(0.0, 0.0), scale).g;

          float diff = 0.0;
          diff += fetch(vec2(0.0, 1.0), scale).r - currentPos;
          diff += fetch(vec2(0.0, -1.0), scale).r - currentPos;
          diff += fetch(vec2(1.0, 0.0), scale).r - currentPos;
          diff += fetch(vec2(-1.0, 0.0), scale).r - currentPos;
          diff *= 0.25 * 2.0;
          diff +=  length(mouseVec) < 0.06 ? 0.4 : 0.0;
          float nextPos = 0.97 * (diff + currentVel) + currentPos;
          float nextVec = nextPos - currentPos;
          nextVec -= 0.04 * nextPos;
          o_wave = vec4(vec2(nextPos, nextVec), 1.0, 1.0);
        }`
  })

  const renderProgram = new Program(core, {
    attributeTypes: {
      a_position    : 'vec2',
      a_textureCoord: 'vec2'
    },
    texture: {t_wave: null},
    vert   : /* glsl */ `
        out vec2 v_uv;
        void main() {
          v_uv = a_textureCoord;
          gl_Position = vec4(a_position, 1.0, 1.0);
        }`,
    frag: /* glsl */ `
        in vec2 v_uv;
        out vec4 o_color;
        void main() {
          o_color = vec4(texture(t_wave, v_uv).r);
        }`
  })

  mouseState.on(({x, y}) => {
    waveProgram.setUniform({u_mouse: [x, y]})
  })

  resizeState.on(({width, height}) => {
    waveProgram.setUniform({u_resolution: [waveRenderers.read.pixelRatio * width, waveRenderers.read.pixelRatio * height]
    })
    renderer.render(planeVAO, renderProgram)
  })

  const animation = new Loop({callback: () => {
    waveProgram.setTexture({t_preWave: waveRenderers.read.renderTexture[0]})
    waveRenderers.write.render(planeVAO, waveProgram)
    waveRenderers.swap()
    renderProgram.setTexture({t_wave: waveRenderers.read.renderTexture[0]})
    renderer.render(planeVAO, renderProgram)
  }})
  animation.start()
}