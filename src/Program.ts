import {AttributeName, AttributeType, Core} from '.'
import {keys, oMapO, oForEach, oReduce, PartialRecord} from 'jittoku'
import {ProgramId, UniformName, UniformType} from './types'

const test = (target: string, key: string) => new RegExp(`[-=+*(]${key}[-=+*).;]`).test(target)

export class Program<T extends UniformName = 'u_resolution', K extends UniformName= 'u_texture'> {
  core: Core
  id: ProgramId
  vert: string
  frag: string
  uniforms: Record<T | K, {type: UniformType, value: null | number | number []}>
  texture: K[]
  constructor(core: Core, {id, attributeTypes, uniformTypes = {} as Record<T, UniformType>, frag, vert, texture}:
    {
      id: ProgramId, attributeTypes: Record<AttributeName, AttributeType>, uniformTypes?: Record<T, UniformType>,
      frag: string, vert: string, texture?: Record<K, WebGLTexture>
    }) {
    this.core = core
    this.id = id
    this.vert = vert
    this.frag = frag
    this.uniforms = oMapO(uniformTypes, ([key, type]) => [key, {type, value: null}]) as Record<T | K, {type: UniformType, value: null | number | number []}>
    this.texture = []

    const parsed = this.#parseShader({vert, frag, attributeTypes, uniformTypes})

    if (!core.program[this.id]) {
      this.core.setProgram(this.id, parsed.vert, parsed.frag)
      this.core.setUniLoc(this.id, keys(uniformTypes))
      this.core.setAttLoc(this.id, attributeTypes)
    }

    if(texture) {
      oForEach(texture, (([uniform, data], i) => {
        const textureNum = core.setTexture(uniform, data)
        this.uniforms[uniform] = {type: 'int', value: textureNum}
        this.texture[i] = uniform
      }))
    }

  }

  #parseShader({vert, frag, attributeTypes, uniformTypes}: {
    vert: string, frag: string,
    attributeTypes: Record<AttributeName, AttributeType>, uniformTypes: Record<T, UniformType>
  }) {
    const uniformKeys = new Set(keys(uniformTypes))
    const testVert = (key: T) => test(vert, key)
    const testFrag = (key: T) => test(frag, key)

    let fullVert = oReduce(uniformTypes,
      (result, [name, type]) => {
        const res = testVert(name)
        if (res) uniformKeys.delete(name)
        return result + (res ? `uniform ${type} ${name};\n` : '')
      },
      '#version 300 es\n'
    )
    fullVert = oReduce(attributeTypes,
      (result, [name, type]) => {
        return result + `in ${type} ${name};\n`
      }, fullVert) + this.vert

    const fullFrag = oReduce(uniformTypes,
      (result, [name, type]) => {
        const res = testFrag(name)
        if (res) uniformKeys.delete(name)
        return result + (res ? `uniform ${type} ${name};\n` : '')
      },
      '#version 300 es\nprecision highp float;\n'
    ) + this.frag

    if(uniformKeys.size) console.warn('unused uniform keys : ' + [...uniformKeys.values()].join(', '))
    return {vert: fullVert, frag: fullFrag}
  }

  set(uniformValues: PartialRecord<T, number | number[]>) {
    oForEach(uniformValues as Record<T, number | number[]>, ([k, v]) => {
      this.uniforms[k].value = v
    })
  }

}
