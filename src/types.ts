import {uniMethod} from './constants'
import {PickType} from './util'

export type WebGLConstants = keyof PickType<WebGL2RenderingContext, number>
export type WebGLEnables =
  'BLEND' | 'CULL_FACE' | 'DEPTH_TEST' | 'DITHER' | 'POLYGON_OFFSET_FILL' | 'SAMPLE_ALPHA_TO_COVERAGE'
| 'SAMPLE_COVERAGE' | 'SCISSOR_TEST' | 'STENCIL_TEST'
export type PrimitiveTypes = 'TRIANGLES' | 'POINTS' | 'LINES' | 'LINE_STRIP' | 'LINE_LOOP' | 'TRIANGLE_STRIP' | 'TRIANGLE_FAN'
export type TextureFilter = 'NEAREST' | 'LINEAR' | 'NEAREST_MIPMAP_NEAREST' | 'NEAREST_MIPMAP_LINEAR' | 'LINEAR_MIPMAP_NEAREST' | 'LINEAR_MIPMAP_LINEAR'
export type TextureWrap = 'REPEAT' | 'MIRRORED_REPEAT' | 'CLAMP_TO_EDGE'
export type TextureFormat = 'RGB' | 'RGBA' | 'DEPTH_COMPONENT' | 'DEPTH_STENCIL' | 'ALPHA' |'LUMINANCE' |'LUMINANCE_ALPHA'
export type TextureInternalFormat =
  'RGB' | 'RGBA' | 'RGB8' |'RGB16F' |'RGB32F' | 'RGBA8' | 'RGBA16F' | 'RGBA32F'
  | 'DEPTH_COMPONENT16' | 'DEPTH_COMPONENT24' | 'DEPTH_COMPONENT32F' | 'DEPTH24_STENCIL8' | 'DEPTH32F_STENCIL8'| 'ALPHA' |'LUMINANCE' |'LUMINANCE_ALPHA'
export type TextureType = 'SHORT' | 'UNSIGNED_SHORT' | 'BYTE' | 'UNSIGNED_BYTE' | 'HALF_FLOAT' | 'FLOAT'
export type TextureArgs = [TextureInternalFormat, TextureFormat, TextureType, TextureFilter, TextureWrap]
export type UniformMethod = Extract<keyof WebGL2RenderingContext, `uniform${string}`>
export type UniformType = keyof typeof uniMethod
export type AttributeType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'mat2' | 'mat3' | 'mat4'
export type Uniforms = Record<UniformName | TextureName, { type: UniformType; value: null | number | number[]; dirty: boolean }>
export type ColorArray = [r: number, g: number, b: number, a: number]

export type ProgramId = string
export type VaoId = string
export type RendererId = string
export type UniformName = `u_${string}`
export type TextureName = `t_${string}`
export type AttributeName = `a_${string}`
export type OutputName = `o_${string}`
export type ResizeArgs = {width?: number, height?: number, pixelRatio?: number}
