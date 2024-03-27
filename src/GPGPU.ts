import {firstEntry, keys, oReduce} from 'jittoku'
import {AttributeName, AttributeType, AttributeTypes, Core, OutputName, ProgramId, UniformName, UniformType, Vao, strideMap, testKeyword} from '.'

type TransformFeedback = Record<OutputName, AttributeType>

export class GPGPU <T extends UniformName = 'u_resolution'> {
  core: Core
  id: ProgramId
  vert: string
  vao: Vao

  constructor(core: Core, {
    id,
    attributeTypes,
    attributes,
    transformFeedback,
    uniformTypes = {} as Record<T, UniformType>,
    vert
  }:
    {
      id: ProgramId,
      attributeTypes: AttributeTypes,
      attributes: Record<AttributeName, number[]>,
      transformFeedback: TransformFeedback,
      uniformTypes?: Record<T, UniformType>,
      vert: string
    }) {
    this.core = core
    this.id = id
    this.vert = vert

    const transformFeedbackTarget = keys(transformFeedback)
    const parsedVert = this.#parseShader({vert, attributeTypes, uniformTypes, transformFeedback})
    if (!core.program[this.id]) {
      this.core.setProgram(this.id, parsedVert, dummyFrag, transformFeedbackTarget)
      this.core.setUniLoc(this.id, keys(uniformTypes))
      this.core.setAttLoc(this.id, attributeTypes)
    }

    this.vao = new Vao(core, {id, attributes})

    const tfBuffer = core.gl.createBuffer()
    const tf = core.gl.createTransformFeedback()

    const [, outType] = firstEntry(transformFeedback)

    const size = Float32Array.BYTES_PER_ELEMENT * Number(strideMap[outType])
    core.gl.bindBuffer(core.gl.ARRAY_BUFFER, tfBuffer)
    core.gl.bufferData(core.gl.ARRAY_BUFFER, size, core.gl.DYNAMIC_COPY)
    core.gl.bindBuffer(core.gl.ARRAY_BUFFER, null)

    // core.gl.enable(core.gl.RASTERIZER_DISCARD)

    core.useProgram(id)
    core.useVao(this.vao.id)

    core.gl.bindTransformFeedback(core.gl.TRANSFORM_FEEDBACK, tf)
    core.gl.bindBufferBase(core.gl.TRANSFORM_FEEDBACK_BUFFER, 0, tfBuffer)

    core.gl.beginTransformFeedback(core.gl.POINTS)
    console.log(core)
    this.core.render('POINTS', false)
    core.gl.endTransformFeedback()

    const result = new Float32Array(4)
    core.gl.getBufferSubData(core.gl.TRANSFORM_FEEDBACK_BUFFER, 0, result)
    console.log(result)

  }

  #parseShader({vert, attributeTypes, uniformTypes, transformFeedback}: {
    vert: string,
    attributeTypes: Record<AttributeName, AttributeType>,
    uniformTypes: Record<T, UniformType>,
    transformFeedback: TransformFeedback
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
      (result, [name, type]) => result + `in ${type} ${name};\n`, fullVert)
    fullVert = oReduce(transformFeedback,
      (result, [name, type]) => result + `out ${type} ${name};\n`, fullVert) + this.vert


    if(uniformKeys.size) console.warn('unused uniform keys : ' + [...uniformKeys.values()].join(', '))
    return fullVert
  }
}

const dummyFrag = /* glsl */ `#version 300 es
precision highp float;
out vec4 o_color;
void main() {
  o_color = vec4(1.0);
}
`