import {main as helloTriangle} from './examples/helloTriangle/main'
import {main as attributes} from './examples/attributes/main'
import {main as uniforms} from './examples/uniforms/main'
import {main as animation} from './examples/animation/main'
import {main as resize} from './examples/resize/main'
import {main as texture} from './examples/texture/main'
import {main as gpgpu} from './examples/gpgpu/main'
import {main as _3d} from './examples/3d/main'
import {main as instancing} from './examples/instancing/main'
import {main as frameBuffer} from './examples/frameBuffer/main'
import {setState} from 'glaku'

export const srcRecord = {
  helloTriangle,
  attributes,
  uniforms,
  animation,
  resize,
  texture,
  frameBuffer,
  '3d': _3d,
  instancing,
  gpgpu
} as const

type SrcType = keyof typeof srcRecord

console.log('starting worker')

let canvas: OffscreenCanvas | null = null

onmessage = async({data}) => {
  const {canvas : offscreenCanvas, src, state} = data
  if (offscreenCanvas) canvas = offscreenCanvas as OffscreenCanvas
  if (src) srcRecord[src as SrcType](canvas!)
  if (state) setState(state)
}

export default {}
