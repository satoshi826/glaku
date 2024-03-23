import {Core} from '.'
import {keys, oMapO, oForEach} from 'jittoku'
import {ProgramId, UniformName, UniformType} from './types'

let counter = 0

export class Program<T extends UniformName> {
  core: Core
  id: ProgramId
  vert: string
  frag: string
  texture: Record<UniformName, WebGLTexture>
  uniforms: Record<T, {type: UniformType, value: null | number | number []}>

  constructor(core: Core, {id, uniformTypes = {} as Record<T, UniformType>, frag, vert, texture}:
    {
      id?: ProgramId, uniformTypes?: Record<T, UniformType>, frag: string, vert: string, texture?: Record<UniformName, WebGLTexture>
    }) {
    this.core = core
    this.id = id ?? String(counter++)
    this.vert = vert
    this.frag = frag
    this.uniforms = oMapO(uniformTypes, ([key, type]) => [key, {type, value: null}])
    this.texture = {}

    if (!core.program[this.id]) {
      this.core.setProgram(this.id, this.vert, this.frag)
      this.core.setUniLoc(this.id, keys(uniformTypes))
    }

    if(texture) {
      oForEach(texture, (([uniform, data], i) => {
        const textureNum = core.setTexture(uniform, data)
        this.uniforms[uniform] = {type: 'int', value: textureNum}
        this.texture[i] = uniform
      }))
    }

  }

  set(uniformValues: Record<T, number | number[]>) {
    oForEach(uniformValues, ([k, v]) => {
      this.uniforms[k].value = v
    })
  }

}
