import {AttributeType, UniformMethod} from '.'

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

export const strideMap = {
  float: 1,
  vec2 : 2,
  vec3 : 3,
  vec4 : 4,
  mat2 : [2, 2],
  mat3 : [3, 3],
  mat4 : [4, 4]
} as const satisfies Record<AttributeType, number | number[]>