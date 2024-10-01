import {Core, Loop, Program, RGBA32F, Renderer, Vao, calcAspectRatioVec, plane2D} from 'glaku'
import {mouseState, resizeState} from '../state'

const times = (i :number, f: (index: number) => void) => {
  for (let index = 0; index < i; index++) f(index)
}
class PingPong {
  read
  write
  constructor(core: Core) {
    this.read = new Renderer(core, {frameBuffer: [RGBA32F]})
    this.write = new Renderer(core, {frameBuffer: [RGBA32F]})
  }
  swap() {
    [this.read, this.write] = [this.write, this.read]
  }
}

export const main = async(canvas: HTMLCanvasElement | OffscreenCanvas) => {

  const core = new Core({canvas, resizeListener: (fn) => resizeState.on(fn), pixelRatio: 1})

  const divergenceRenderer = new Renderer(core, {frameBuffer: [RGBA32F]})
  const pressureRenderers = new PingPong(core)
  const velocityRenderer = new Renderer(core, {frameBuffer: [RGBA32F, RGBA32F]})
  const colorRenderer = new Renderer(core, {frameBuffer: [RGBA32F]})
  const renderer = new Renderer(core)
  const vao = new Vao(core, plane2D())

  const divergenceProgram = new Program(core, {
    id            : 'divergence',
    attributeTypes: {a_position: 'vec2'},
    uniformTypes  : {u_resolution: 'vec2'},
    texture       : {t_velocity: null},
    vert          : /* glsl */ `
      void main() {
        gl_Position = vec4(a_position, 1.0, 1.0);
    }`,
    frag: /* glsl */`
        out vec4 o_color;
        vec4 fetch(vec2 coord, vec2 scale) {return texture(t_velocity, (gl_FragCoord.xy + coord) * scale);}
        void main() {
          vec2 scale = 1.0 / u_resolution;
          vec3 current = fetch(vec2(0.0, 0.0), scale).xyz;
          vec2 vLeft   = fetch(vec2(-1.0, 0.0), scale).xy;
          vec2 vRight  = fetch(vec2(1.0, 0.0), scale).xy;
          vec2 vTop    = fetch(vec2(0.0, 1.0), scale).xy;
          vec2 vBottom = fetch(vec2(0.0, -1.0), scale).xy;
          float divergence = ((vRight.x - vLeft.x) + (vBottom.y - vTop.y) * 0.5);
          o_color = vec4(current, divergence);
        }`
  })

  const pressureProgram = new Program(core, {
    id            : 'pressure',
    attributeTypes: {a_position: 'vec2'},
    uniformTypes  : {u_resolution: 'vec2'},
    texture       : {t_prePressure: null},
    vert          : /* glsl */ `
      void main() {
        gl_Position = vec4(a_position, 1.0, 1.0);
    }`,
    frag: /* glsl */`
      out vec4 o_color;
      vec4 fetch(vec2 coord, vec2 scale) {return texture(t_prePressure, (gl_FragCoord.xy + coord) * scale);}
      void main() {
        vec2 scale = 1.0 / u_resolution;
        vec4 current = fetch(vec2(0.0, 0.0), scale);
        float pLeft   = fetch(vec2(-1.0, 0.0), scale).z;
        float pRight  = fetch(vec2(1.0, 0.0), scale).z;
        float pTop    = fetch(vec2(0.0, 1.0), scale).z;
        float pBottom = fetch(vec2(0.0, -1.0), scale).z;
        float divergence = current.w;
        float pressure = (divergence * 0.2 + (pLeft + pRight + pTop + pBottom)) * 0.25 * 1.0;
        o_color = vec4(current.xy, pressure, divergence);
      }`
  })

  const velocityProgram = new Program(core, {
    id            : 'velocity',
    attributeTypes: {a_position: 'vec2'},
    uniformTypes  : {
      u_resolution: 'vec2',
      u_mouse     : 'vec2',
      u_mouse_prev: 'vec2',
      u_elapsed   : 'float'
    },
    texture: {
      t_nextPressure: null,
      t_prevColor   : null
    },
    vert: /* glsl */ `
      void main() {
        gl_Position = vec4(a_position, 1.0, 1.0);
    }`,
    frag: /* glsl */`
      layout (location = 0) out vec4 o_data;
      layout (location = 1) out vec4 o_color;
      vec4 fetch(vec2 coord, vec2 scale) {return texture(t_nextPressure, (gl_FragCoord.xy + coord) * scale);}
      vec4 fetchColor(vec2 coord, vec2 scale) {return texture(t_prevColor, (gl_FragCoord.xy + coord) * scale);}
      vec3 hsvToRgb(vec3 c){
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }
      vec3 rgbToHsv(vec3 c){
        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
        vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
        float d = q.x - min(q.w, q.y);
        float e = 1.0e-10;
        return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
      }
      void main() {
        vec2 scale = 1.0 / u_resolution;
        vec4 current = fetch(vec2(0.0, 0.0), scale);
        float pLeft   = fetch(vec2(-1.0, 0.0), scale).z;
        float pRight  = fetch(vec2(1.0, 0.0), scale).z;
        float pTop    = fetch(vec2(0.0, 1.0), scale).z;
        float pBottom = fetch(vec2(0.0, -1.0), scale).z;
        vec2 velocity = vec2(pRight - pLeft, pBottom - pTop) * 0.5;
        vec2 currentPoint = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
        vec2 mouseVec = currentPoint - u_mouse;
        vec2 mouseDiff = u_mouse - u_mouse_prev;
        float power = 40000.0 * length(mouseDiff) * smoothstep(4.0, 20.0, min(1.0 / length(mouseVec), 4000.0));
        velocity *= 0.99;
        velocity += power * mouseDiff;
        o_data = vec4(velocity, current.zw);

        float pressure = current.z;
        float avx = abs(velocity.x);
        float avy = abs(velocity.y);
        vec3 color = hsvToRgb(vec3(u_elapsed / 25000.0 + 0.0, 0.7, min(0.8 * power, 100000.0)));
        vec3 prevColor = rgbToHsv(fetchColor(20.0 * velocity, scale).rgb);
        o_color = vec4(hsvToRgb(vec3(prevColor.xy, prevColor.z * 0.998)) + 0.0012 * color, 1.0);
      }`
  })

  const renderProgram = new Program(core, {
    id            : 'render',
    attributeTypes: {
      a_position    : 'vec2',
      a_textureCoord: 'vec2'
    },
    texture: {t_color: null},
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
          o_color = texture(t_color, v_uv);
        }`
  })

  const programs = [divergenceProgram, pressureProgram, velocityProgram]
  const setResolution = (w: number, h: number) => {
    programs.forEach(p => p.setUniform({u_resolution: [
      Math.trunc(core.pixelRatio * w), Math.trunc(core.pixelRatio * h)
    ]}))
  }
  setResolution(divergenceRenderer.width, divergenceRenderer.height)
  resizeState.on(({width, height}) => {
    if (!width || !height) return
    setResolution(width, height)
  })

  mouseState.on(({x, y}) => {
    const [a, b] = calcAspectRatioVec(renderer.width, renderer.height)
    velocityProgram.setUniform({u_mouse: [a * x, b * y]})
  })

  const animation = new Loop({callback: ({elapsed}) => {
    divergenceProgram.setTexture({t_velocity: velocityRenderer.renderTexture[0]})
    divergenceRenderer.render(vao, divergenceProgram)

    pressureProgram.setTexture({t_prePressure: divergenceRenderer.renderTexture[0]})
    pressureRenderers.write.render(vao, pressureProgram)

    times(10, () => {
      pressureRenderers.swap()
      pressureProgram.setTexture({t_prePressure: pressureRenderers.read.renderTexture[0]})
      pressureRenderers.write.render(vao, pressureProgram)
    })

    velocityProgram.setTexture({t_nextPressure: pressureRenderers.write.renderTexture[0], t_prevColor: colorRenderer.renderTexture[0]})
    velocityRenderer.render(vao, velocityProgram)
    velocityProgram.setUniform({
      u_mouse_prev: velocityProgram.uniforms.u_mouse.value as number[],
      u_elapsed   : elapsed
    })

    renderProgram.setTexture({t_color: velocityRenderer.renderTexture[1]})
    colorRenderer.render(vao, renderProgram)
    renderer.render(vao, renderProgram)

  }})
  animation.start()
}