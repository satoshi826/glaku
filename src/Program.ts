import {AttributeName, AttributeType, Core, PrimitiveTypes, TextureName} from '.'
import {keys, oMapO, oForEach, oReduce, PartialRecord} from 'jittoku'
import {ProgramId, UniformName, UniformType} from './types'

export type AttributeTypes = Record<AttributeName, AttributeType>

export const testKeyword = (target: string, key: string) => new RegExp(`[-=+*/(\\s,]${key}[-=+*/).,;\\s]`).test(target)

export class Program<T extends UniformName, K extends TextureName> {
  core: Core
  id: ProgramId
  vert: string
  frag: string
  uniforms: Record<T | K, {type: UniformType, value: null | number | number []}>
  texture: K[]
  primitive: PrimitiveTypes
  constructor(core: Core, {
    id, attributeTypes, uniformTypes = {} as Record<T, UniformType>,
    frag, vert, texture = {}, primitive = 'TRIANGLES'
  }:
    {
      id: ProgramId, attributeTypes: AttributeTypes, uniformTypes?: Record<T, UniformType>,
      frag: string, vert: string, texture?: Record<K, WebGLTexture>, primitive?: PrimitiveTypes
    }) {
    this.core = core
    this.id = id
    this.vert = vert
    this.frag = frag
    this.uniforms = oMapO(uniformTypes, ([key, type]) => [key, {type, value: null}]) as Record<T | K, {type: UniformType, value: null | number | number []}>
    this.texture = []
    this.primitive = primitive

    const parsed = this.#parseShader({vert, frag, attributeTypes, uniformTypes, texture})

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

  set(uniformValues: PartialRecord<T, number | number[]>) {
    oForEach(uniformValues as Record<T, number | number[]>, ([k, v]) => {
      this.uniforms[k].value = v
    })
  }

  #parseShader({vert, frag, attributeTypes, uniformTypes, texture}: {
    vert: string, frag: string,
    attributeTypes: AttributeTypes, uniformTypes: Record<T, UniformType>, texture: Record<K, WebGLTexture>
  }) {
    const uniformKeys = new Set(keys(uniformTypes))
    const textureKeys = new Set(keys(texture))
    const testVert = (key: T) => testKeyword(vert, key)
    const testFrag = (key: T | K) => testKeyword(frag, key)

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

    let fullFrag = oReduce(uniformTypes,
      (result, [name, type]) => {
        const res = testFrag(name)
        if (res) uniformKeys.delete(name)
        return result + (res ? `uniform ${type} ${name};\n` : '')
      },
      '#version 300 es\nprecision highp float;\n'
    )
    fullFrag = oReduce(texture,
      (result, [name]) => {
        const res = testFrag(name)
        if (res) textureKeys.delete(name)
        return result + (res ? `uniform sampler2D ${name};\n` : '')
      },
      fullFrag
    ) + this.frag

    if(uniformKeys.size) console.warn(`--- programId: ${this.id} --- unused uniform keys : ${ [...uniformKeys.values()].join(', ')}`)
    return {vert: fullVert, frag: fullFrag}
  }

}
