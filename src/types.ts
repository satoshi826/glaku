import {PickType} from 'jittoku'
import {uniMethod} from './constants'

export type WebGLConstants = keyof PickType<WebGL2RenderingContextBase, number>
export type PrimitiveTypes = 'TRIANGLES' | 'POINTS' | 'LINES'
export type UniformMethod = Extract<keyof WebGL2RenderingContext, `uniform${string}`>
export type UniformType = keyof typeof uniMethod
export type AttributeType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'mat2' | 'mat3' | 'mat4'
export type Uniforms = Record<UniformName, { type: UniformType; value: null | number | number[] }>
export type ColorArray = [r: number, g: number, b: number, a: number]

export type ProgramId = string
export type VaoId = string
export type RendererId = number
export type UniformName = `u_${string}`
export type TextureName = `t_${string}`
export type AttributeName = `a_${string}`
export type OutputName = `o_${string}`
export type ResizeArgs = {width?: number, height?: number, pixelRatio?: number}
