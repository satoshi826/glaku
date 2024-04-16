import {PartialRecord, keys, oForEach, oMapO, oReduce, range} from 'jittoku'
import {AttributeName, AttributeType, AttributeTypes, Core, OutputName, ProgramId, UniformName, UniformType, Vao, testKeyword} from '..'

const outputNames = (v: AttributeTypes) => keys(v).map(a => a.replace('a_', 'a_tf_')) as OutputName[]

export class GPGPU <T extends UniformName = 'u_resolution'> {
  core: Core
  id: ProgramId
  vert: string
  attributeTypes: AttributeTypes
  vaoArray: [Vao, Vao]
  uniforms: Record<T, {type: UniformType, value: null | number | number []}>
  indexR: 0 | 1
  indexW: 0 | 1
  vboArray: { vbo: Record<`a_${string}`, WebGLBuffer | null>; transformFeedback: WebGLTransformFeedback | null }[]

  constructor(core: Core, {
    id,
    attributeTypes,
    attributes,
    uniformTypes = {} as Record<T, UniformType>,
    vert
  }:
    {
      id: ProgramId,
      attributeTypes: AttributeTypes,
      attributes: Record<AttributeName, number[]>,
      uniformTypes?: Record<T, UniformType>,
      vert: string
    }) {
    this.core = core
    this.id = id
    this.vert = vert
    this.attributeTypes = attributeTypes
    this.indexR = 0
    this.indexW = 1

    const transformFeedbackTarget = outputNames(attributeTypes)
    const parsedVert = this.#parseShader({vert, attributeTypes, uniformTypes})
    if (core.program[this.id]) throw new Error('Already exists gpgpu id')
    this.core.setProgram(this.id, parsedVert, dummyFrag, transformFeedbackTarget)
    this.core.setAttLoc(this.id, attributeTypes)
    this.core.setUniLoc(this.id, keys(uniformTypes))

    this.vaoArray = [new Vao(core, {id: `${id}_vao1`, attributes}), new Vao(core, {id: `${id}_vao2`, attributes})]
    this.vboArray = range(2).map(() => {
      const transformFeedback = core.gl.createTransformFeedback()
      core.gl.bindTransformFeedback(core.gl.TRANSFORM_FEEDBACK, transformFeedback)
      const vbo = oMapO(attributes, ([name, value], i) => {
        const vbo = this.core.createVbo(new Float32Array(value), this.core.gl.DYNAMIC_DRAW)
        core.gl.bindBuffer(core.gl.ARRAY_BUFFER, vbo)
        core.gl.bindBufferBase(core.gl.TRANSFORM_FEEDBACK_BUFFER, i, vbo)
        core.gl.bindBuffer(core.gl.ARRAY_BUFFER, null)
        return[name, vbo]
      })
      core.gl.bindTransformFeedback(core.gl.TRANSFORM_FEEDBACK, null)
      return {vbo, transformFeedback}
    })
    this.uniforms = oMapO(uniformTypes, ([key, type]) => [key, {type, value: null}]) as Record<T, {type: UniformType, value: null | number | number []}>
  }

  get vao() {
    return this.vaoArray[this.indexR]
  }

  #swap() {
    [this.indexR, this.indexW] = [this.indexW, this.indexR]
  }

  run() {
    const core = this.core
    core.useVao(this.vaoArray[this.indexW].id)
    core.useProgram(this.id)
    core.setUniforms(this.uniforms)

    core.gl.enable(core.gl.RASTERIZER_DISCARD)

    core.gl.bindTransformFeedback(core.gl.TRANSFORM_FEEDBACK, this.vboArray[this.indexR].transformFeedback)
    core.gl.beginTransformFeedback(core.gl.POINTS)
    core.render('POINTS', false)
    core.gl.disable(core.gl.RASTERIZER_DISCARD)
    core.gl.endTransformFeedback()
    core.gl.bindTransformFeedback(core.gl.TRANSFORM_FEEDBACK, null)

    core.useVao(this.vaoArray[this.indexR].id)
    oForEach(this.vboArray[this.indexR].vbo, (([att, vbo]) => {
      core.gl.bindBuffer(this.core.gl.ARRAY_BUFFER, vbo)
      core.enableAttribute(att)
    }))
    this.#swap()
  }

  set(uniformValues: PartialRecord<T, number | number[]>) {
    oForEach(uniformValues as Record<T, number | number[]>, ([k, v]) => {
      this.uniforms[k].value = v
    })
  }

  #parseShader({vert, attributeTypes, uniformTypes}: {
    vert: string,
    attributeTypes: Record<AttributeName, AttributeType>,
    uniformTypes: Record<T, UniformType>,
  }) {
    const uniformKeys = new Set(keys(uniformTypes))
    const testVert = (key: T) => testKeyword(vert, key)

    let fullVert = oReduce(uniformTypes,
      (result, [name, type]) => {
        const res = testVert(name)
        if (res) uniformKeys.delete(name)
        return result + (res ? `uniform ${type} ${name};\n` : '')
      },
      '#version 300 es\n'
    )
    fullVert = oReduce(attributeTypes,
      (result, [name, type]) => result +
        `in ${type} ${name};\nout ${type} ${name.replace('a_', 'a_tf_')};\n`, fullVert) + this.vert

    if(uniformKeys.size) console.warn('unused uniform keys : ' + [...uniformKeys.values()].join(', '))
    return fullVert
  }
}

const dummyFrag = /* glsl */ `#version 300 es
precision highp float;
void main() {
  discard;
}
`