import {Core, Loop, Program, Renderer, Vao, calcAspectRatioVec} from 'glaku'
import {imageState, mouseState, resizeState} from '../state'

export const main = async(canvas: HTMLCanvasElement | OffscreenCanvas, pixelRatio: number) => {

  const core = new Core({canvas, resizeListener: (fn) => resizeState.on(fn), pixelRatio})
  const renderer = new Renderer(core)

  const image = await new Promise<ImageBitmap>((resolve) => {
    const off = imageState.on((img) => {
      if (img) {
        resolve(img)
        off()
      }
    })
  })
  // const image = document.getElementById('image')

  const texture = core.createTexture({image})

  const program = new Program(core, {
    id            : 'texture',
    attributeTypes: {
      a_position    : 'vec2',
      a_textureCoord: 'vec2'
    },
    uniformTypes: {
      u_aspectRatio      : 'vec2',
      u_aspectRatio_image: 'vec2',
      u_mouse            : 'vec2'
    },
    texture: {
      t_texture: texture
    },
    vert: /* glsl */ `
    out vec2 v_uv;
        void main() {
          vec2 pos = (u_aspectRatio_image * (0.6*a_position))/ u_aspectRatio;
          v_uv = a_textureCoord;
          gl_Position = vec4(pos,1.0,1.0);
        }`,
    frag: /* glsl */`
        vec3 rgbToHsv(vec3 c){
          vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
          vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
          vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
          float d = q.x - min(q.w, q.y);
          float e = 1.0e-10;
          return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }

        vec3 hsvToRgb(vec3 c){
          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        in vec2 v_uv;
        out vec4 o_color;
        void main() {
          vec3 texture_rgb = texture(t_texture, v_uv).rgb;
          vec3 texture_hsv = rgbToHsv(texture_rgb);
          float new_h = texture_hsv.x + u_mouse.x * 0.5;
          float new_s = max(texture_hsv.y + u_mouse.y *0.5, 0.0);
          vec3 result_color = hsvToRgb(vec3(new_h, new_s, texture_hsv.z));
          o_color = vec4(result_color, 1.0);
        }`
  })
  const vao = new Vao(core, {
    id        : 'plane',
    attributes: {
      a_position: [
        -1.0, 1.0,
        1.0, 1.0,
        -1.0, -1.0,
        1.0, -1.0
      ],
      a_textureCoord: [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
      ]
    },
    index: [
      2, 1, 0,
      1, 2, 3
    ]
  })

  program.setUniform({u_aspectRatio_image: calcAspectRatioVec(image.width, image.height)})

  resizeState.on(({width, height}) => {
    program.setUniform({u_aspectRatio: calcAspectRatioVec(width, height)})
  })

  mouseState.on(({x, y}) => {
    program.setUniform({u_mouse: [x, y]})
  })

  const animation = new Loop({callback: () => {
    renderer.clear()
    renderer.render(vao, program)
  }})

  animation.start()
}

//----------------------------------------------------------------
