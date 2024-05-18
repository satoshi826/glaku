import {aToO, oForEach} from 'jittoku'
import {AttributeName, Core} from '.'
import {VaoId} from './types'

type InstancedValue = Record<AttributeName, number[]>

let counter = 0

export class Vao {
  core: Core
  id: VaoId
  attributes: Record<AttributeName, number[]>
  index?: number[]
  maxInstance: number
  instancedAttributes: Record<AttributeName, {array: Float32Array | null, vbo: WebGLBuffer | null}> | null
  instancedCount: null | number

  constructor(core: Core, {id, attributes, index, instancedAttributes, maxInstance}:
      {id?: VaoId, attributes: Record<AttributeName, number[]>, index?: number[], instancedAttributes?: string[], maxInstance?: number}
  ) {
    this.core = core
    this.id = id ?? String(counter++)
    this.attributes = attributes
    this.index = index

    this.maxInstance = maxInstance ?? 1000
    this.instancedAttributes = instancedAttributes
      ? aToO(instancedAttributes, (att) => [att, {array: null, vbo: null}])
      : null

    this.instancedCount = null
  }

  setVao() {
    this.core.setVao({
      id        : this.id,
      index     : this.index,
      attributes: this.attributes
    })
  }

  setInstancedValues(instancedValue: InstancedValue) {
    oForEach(instancedValue, (([att, value]) => {
      const strideSize = this.core.getStrideSize(att)
      this.instancedAttributes![att].array ??= new Float32Array(this.maxInstance * strideSize)
      this.instancedCount = value.length / strideSize
      for (let i = 0; i < value.length; i++) this.instancedAttributes![att].array![i] = value[i]
    }))
  }

  updateInstancedVbo(){
    this.instancedAttributes && oForEach(this.instancedAttributes, ([att, {array, vbo}]) => {
      vbo ??= this.core.createInstancedVbo(this.id, att, array!)
      this.core.updateVbo(this.id, att, array!, vbo)
    })
  }
}

