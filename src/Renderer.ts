import {Core} from '.'
import {Program} from './Program'
import {Vao} from './Vao'
import {ColorArray, WebGLConstants, ResizeArgs} from './types'

export const RGBA8 = ['RGBA', 'RGBA', 'UNSIGNED_BYTE', 'LINEAR']
export const RGBA16F = ['RGBA16F', 'RGBA', 'HALF_FLOAT', 'LINEAR']
export const RGBA32F = ['RGBA32F', 'RGBA', 'FLOAT', 'LINEAR']
export const DEPTH = ['DEPTH_COMPONENT16', 'DEPTH_COMPONENT', 'UNSIGNED_SHORT', 'NEAREST']

let id = 0

type GippyTexture = (WebGLTexture & {internalFormat: WebGLConstants, format: WebGLConstants, type: WebGLConstants})
type Textures = [WebGLConstants, WebGLConstants, WebGLConstants, WebGLConstants][]

export class Renderer {
  id: number
  core: Core
  pixelRatio: number
  width: number
  height: number
  resizeQueue: ResizeArgs | null
  backgroundColor: ColorArray
  isCanvas: boolean
  frameBuffer: WebGLFramebuffer | null
  renderTexture: GippyTexture[]
  drawBuffers: number[]
  screenFit: boolean

  constructor(core: Core, {height, width, backgroundColor, frameBuffer, pixelRatio, screenFit = true}: {
    height?: number, width?: number, backgroundColor?: ColorArray, frameBuffer?: Textures, pixelRatio?: number, screenFit?: boolean
  } = {}) {
    this.id = id++
    this.core = core
    this.pixelRatio = this.core.pixelRatio * (pixelRatio ?? 1)
    this.width = width ?? core.canvasWidth
    this.height = height ?? core.canvasHeight
    this.resizeQueue = null
    this.backgroundColor = backgroundColor ?? [0, 0, 0, 1]
    this.isCanvas = !frameBuffer
    this.frameBuffer = null
    this.renderTexture = []
    this.drawBuffers = [this.core.gl.BACK]
    this.screenFit = screenFit

    if (frameBuffer) this.setFrameBuffer(frameBuffer)
    if (screenFit) this.core.resizeListener?.((args) => this.resizeQueue = args)
  }

  resize({width = this.width, height = this.height, pixelRatio = this.pixelRatio}: ResizeArgs = {}) {
    const gl = this.core.gl
    this.width = width
    this.height = height
    gl.viewport(0, 0, width * pixelRatio, height * pixelRatio)
    if(this.isCanvas) {
      gl.canvas.width = width * pixelRatio
      gl.canvas.height = height * pixelRatio
    }else {
      this.renderTexture.forEach((renderTexture) => {
        const {internalFormat, format, type} = renderTexture
        gl.bindTexture(gl.TEXTURE_2D, renderTexture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl[internalFormat], width * pixelRatio, height * pixelRatio, 0, gl[format], gl[type], null)
        gl.bindTexture(gl.TEXTURE_2D, null)
      })
      gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    }
    this.resizeQueue = null
  }

  clear() {
    this.core.useRenderer(this)
    this.core.gl.clearColor(...this.backgroundColor)
    this.core.gl.clearDepth(1.0)
    this.core.gl.clear(this.core.gl.COLOR_BUFFER_BIT | this.core.gl.DEPTH_BUFFER_BIT)
  }

  beforeRender(
    vao: { id: string },
    program: Program
  ) {
    if (this.resizeQueue) this.resize(this.resizeQueue)
    this.core.useVao(vao.id)
    this.core.useRenderer(this)
    this.core.useProgram(program.id)
    this.core.setUniforms(program.uniforms)
    if (program.texture.length) {
      program.texture.forEach((tex) => this.core.useTexture(tex))
    }
    if (program.uniforms.u_resolution) program.set({u_resolution: [this.width * this.pixelRatio, this.height * this.pixelRatio]})
  }

  render(vao: Vao, program: Program) {
    this.beforeRender(vao, program)
    this.core.render()
  }

  renderInstanced(vao: Vao, program: Program) {
    this.beforeRender(vao, program)
    if (vao.instancedCount) {
      this.core.renderInstanced(vao.instancedCount)
    }
  }

  setFrameBuffer(textures: Textures) {
    const gl = this.core.gl

    this.frameBuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer)

    this.renderTexture = []
    textures.forEach(([internalFormat, format, type, filter], i: number) => {
      const attachment = gl.COLOR_ATTACHMENT0 + i
      const texture = this.core.createTexture(this.width, this.height, internalFormat, format, type, filter) as GippyTexture
      if (!texture) throw new Error('Could not create texture')
      gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, texture, 0)
      texture.internalFormat = internalFormat
      texture.format = format
      texture.type = type
      this.renderTexture[i] = texture
      this.drawBuffers[i] = attachment
    })

    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

}