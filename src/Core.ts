import {oForEach, keys, times} from 'jittoku'
import {ProgramId, RendererId, UniformMethod, UniformName, Uniforms, VaoId, WebGLConstants, ResizeArgs, AttributeName} from './types'

export const uniMethod = {
  int  : ['uniform1i', false, false],
  float: ['uniform1f', false, false],
  vec2 : ['uniform2fv', false, true],
  vec3 : ['uniform3fv', false, true],
  vec4 : ['uniform4fv', false, true],
  mat2 : ['uniformMatrix2fv', true, false],
  mat3 : ['uniformMatrix3fv', true, false],
  mat4 : ['uniformMatrix4fv', true, false],
  ivec2: ['uniform2iv', false, true],
  ivec3: ['uniform3iv', false, true],
  ivec4: ['uniform4iv', false, true]
} as const satisfies Record<string, [UniformMethod, isMat: boolean, isArray: boolean]>

const attLocDef = {
  a_position    : 0,
  a_textureCoord: 1
}

const strideDef = {
  a_position    : 3,
  a_textureCoord: 2
}

type AttLocI = Record<AttributeName, number>
type StrideI = Record<keyof AttLocI, number | number[]>

export class Core<
AttLoc extends AttLocI = AttLocI,
Stride extends StrideI = StrideI
> {
  gl: WebGL2RenderingContext
  canvasWidth: number
  canvasHeight: number
  pixelRatio: number
  program: Record<ProgramId, WebGLProgram> = {}
  vao: Record<VaoId, WebGLVertexArrayObject & {count?: number}> = {}
  uniLoc: Record<ProgramId, Record<UniformName, WebGLUniformLocation>> = {}
  texture: Record<string, {data: WebGLTexture, number: number}> = {} // {<name> : {data, number}}
  currentProgram: ProgramId | null = null
  currentVao: VaoId | null = null
  currentRenderer: RendererId | null = null
  attLoc: AttLoc
  stride: Stride
  uniMethod = uniMethod
  resizeListener: null | (((handler: (arg: ResizeArgs) => void) => void)) = null

  constructor({canvas, pixelRatio = 1, resizeListener, attLoc, stride, options}:
    {
      canvas: HTMLCanvasElement,
      pixelRatio?: number,
      resizeListener?: (((handler: (arg: ResizeArgs) => void) => void)),
      attLoc?: AttLoc,
      stride?: Stride,
      options?: WebGLConstants[]}
  ) {
    this.gl = canvas.getContext('webgl2', {antialias: true})!
    this.canvasWidth = this.gl.canvas.width
    this.canvasHeight = this.gl.canvas.height
    this.pixelRatio = pixelRatio
    if (resizeListener) this.resizeListener = resizeListener
    options?.forEach(o => {
      this.gl.enable(this.gl[o])
    })
    this.attLoc = attLoc ?? attLocDef as unknown as AttLoc
    this.stride = stride ?? strideDef as unknown as Stride
    // this.gl.enable(this.gl.CULL_FACE)
    // this.gl.enable(this.gl.DEPTH_TEST)
  }

  #compile(txt: string, type: 'VERTEX' | 'FRAGMENT') {
    const shader = this.gl.createShader(this.gl[`${type}_SHADER`])
    if (!shader) throw new Error('createShader failed')
    this.gl.shaderSource(shader, txt)
    this.gl.compileShader(shader)
    if(this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) return shader
    const log = this.gl.getShaderInfoLog(shader)
    throw new Error(log ?? 'compile error')
  }

  #link(vert: WebGLShader, frag: WebGLShader) {
    const program = this.gl.createProgram()
    if (!program) throw new Error('createProgram failed')
    this.gl.attachShader(program, vert)
    this.gl.attachShader(program, frag)
    this.gl.linkProgram(program)
    if(this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) return program
    const log = this.gl.getShaderInfoLog(program)
    throw new Error(log ?? 'link error')
  }

  setProgram(id: ProgramId, vText: string, fText: string) {
    const shaderV = this.#compile(vText, 'VERTEX')
    const shaderF = this.#compile(fText, 'FRAGMENT')
    const prg = this.#link(shaderV, shaderF)
    this.program[id] = prg
  }

  useProgram(id: ProgramId) {
    if (id !== this.currentProgram) {
      this.gl.useProgram(this.program[id])
      this.currentProgram = id
    }
  }

  setVao({id, index, attributes}: {id: VaoId, index: number[], attributes: Record<keyof AttLoc, number[]>}) {
    const vao = this.gl.createVertexArray()
    this.gl.bindVertexArray(vao)
    oForEach(attributes, ([k, v]) => {
      if (v === undefined) return
      const vbo = this.gl.createBuffer()
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo)
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(v), this.gl.STATIC_DRAW)
      this.enableAttribute(k as AttributeName)
    })
    if(index) {
      const ibo = this.gl.createBuffer()
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo)
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(index), this.gl.STATIC_DRAW)
    }
    this.gl.bindVertexArray(null)
    if (!vao) throw new Error('createVertexArray failed')
    this.vao[id] = vao
    this.vao[id].count = index.length
  }

  enableAttribute(att: AttributeName) {
    const stride = this.stride[att]
    const isUnitAtt = typeof stride === 'number'
    if (isUnitAtt) {
      this.gl.enableVertexAttribArray(this.attLoc[att])
      this.gl.vertexAttribPointer(this.attLoc[att], stride, this.gl.FLOAT, false, 0, 0)
    }else{
      const [row, col] = stride
      for (let i = 0; i < row; i++) {
        this.gl.enableVertexAttribArray(this.attLoc[att] + i)
        this.gl.vertexAttribPointer(this.attLoc[att] + i, col, this.gl.FLOAT, false, row * col * 4, i * col * 4)
      }
    }
  }

  getStrideSize(att: AttributeName) {
    const stride = this.stride[att]
    const isUnitAtt = typeof stride === 'number'
    return isUnitAtt ? stride : stride[0] * stride[1]
  }

  createInstancedVbo(id: VaoId, att: AttributeName, array: Float32Array) {
    this.useVao(id)
    const stride = this.stride[att]
    const isUnitAtt = typeof stride === 'number'
    const vbo = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, array, this.gl.DYNAMIC_DRAW)
    this.gl.vertexAttribDivisor(this.attLoc[att], 1)
    if (isUnitAtt) {
      this.gl.vertexAttribDivisor(this.attLoc[att], 1)
    }else{
      const [row] = stride
      times(row, (i) => {
        this.gl.vertexAttribDivisor(this.attLoc[att] + i, 1)
      })
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null)
    if (!vbo) throw new Error('createInstancedVbo failed')
    return vbo
  }

  updateInstancedVbo(id: VaoId, att: AttributeName, array: Float32Array, vbo: WebGLBuffer) {
    this.useVao(id)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo)
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, array)
    this.enableAttribute(att)
  }

  useVao(id: VaoId) {
    if (id !== this.currentVao) {
      this.gl.bindVertexArray(this.vao[id])
      this.currentVao = id
    }
  }

  setUniLoc(id: ProgramId, uniforms: UniformName[]) {
    this.uniLoc[id] = {}
    uniforms.forEach(uni => {
      const uniLoc = this.gl.getUniformLocation(this.program[id], uni)
      if (!uniLoc) throw new Error('setUniformLocation failed')
      this.uniLoc[id][uni] = uniLoc
    })
  }

  setUniforms(uniforms: Uniforms) {
    oForEach(uniforms, ([k, {type, value}]) => {
      if(value === undefined || value === null) return
      const [method, isMat, isArray] = this.uniMethod[type]
      if (isMat) this.gl[method](this.uniLoc[this.currentProgram!][k], false, value as number[])
      else if (isArray) this.gl[method](this.uniLoc[this.currentProgram!][k], value as number[])
      else this.gl[method](this.uniLoc[this.currentProgram!][k], value as number)
    })
  }

  render() {
    this.gl.drawElements(this.gl.TRIANGLES, this.vao[this.currentVao!].count!, this.gl.UNSIGNED_SHORT, 0)
  }

  renderInstanced(count: number) {
    this.gl.drawElementsInstanced(this.gl.TRIANGLES, this.vao[this.currentVao!].count!, this.gl.UNSIGNED_SHORT, 0, count)
  }

  useRenderer({id, pixelRatio, width, height, frameBuffer, drawBuffers}:
    {id: RendererId, pixelRatio: number, width: number, height: number, frameBuffer: WebGLFramebuffer | null, drawBuffers: number[]}) {
    if (id !== this.currentRenderer) {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer)
      this.gl.drawBuffers(drawBuffers)
      this.gl.viewport(0, 0, width * pixelRatio, height * pixelRatio)
      this.currentRenderer = id
    }
  }

  createTexture(width: number, height: number, internalFormat: WebGLConstants, format: WebGLConstants, type: WebGLConstants, filter: WebGLConstants) {
    const texture = this.gl.createTexture()
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl[internalFormat], width / 2, height / 2, 0, this.gl[format], this.gl[type], null)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl[filter])
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl[filter])
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
    this.gl.bindTexture(this.gl.TEXTURE_2D, null)
    return texture
  }

  setTexture(key: UniformName, data: WebGLTexture) {
    if(this.texture[key]) {
      this.texture[key] = {...this.texture[key], data}
      return this.texture[key].number
    }
    const textureNum = keys(this.texture).length
    this.texture[key] = {data, number: textureNum}
    return textureNum
  }

  useTexture(key: UniformName) {
    const {data, number} = this.texture[key]
    if (data) {
      const attr = `TEXTURE${number}` as WebGLConstants
      this.gl.activeTexture(this.gl[attr])
      this.gl.bindTexture(this.gl.TEXTURE_2D, data)
    }
  }

}

//------------------------------------------------------------------------------

// export const strideMap = {
//   a_position                 : 3,
//   a_textureCoord             : 2,
//   a_instance_messagePosition : 2,
//   a_instance_messageLuminance: 1,
//   a_instance_userPosition    : 2
// }

// const attLocMap = {
//   a_position                 : 0,
//   a_textureCoord             : 1,
//   a_instance_messagePosition : 2,
//   a_instance_messageLuminance: 3,
//   a_instance_userPosition    : 4
// }
//------------------------------------------------------------------------------
