import {Core} from '.'
import {keys, oMapO, oForEach} from 'jittoku'
import {ProgramId, UniformName, UniformType, Uniforms} from './types'

let counter = 0

export class Program {
  core: Core
  id: ProgramId
  vert: string
  frag: string
  texture: UniformName[]
  uniforms: Uniforms

  constructor(core: Core, {id, uniformTypes = {}, frag, vert, texture}:
    {
      id?: ProgramId, uniformTypes?: Record<UniformName, UniformType>, frag: string, vert: string, texture?: Record<UniformName, WebGLTexture>
    }) {
    this.core = core
    this.id = id ?? String(counter++)
    this.vert = vert
    this.frag = frag
    this.uniforms = oMapO(uniformTypes, ([key, type]) => [key, {type, value: null}])
    this.texture = []

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

  set(uniformValues: Record<UniformName, number | number[]>) {
    oForEach(uniformValues, ([k, v]) => {
      this.uniforms[k].value = v
    })
  }

}
