import {main as helloTriangle} from './examples/helloTriangle/main'
import {main as attributes} from './examples/attributes/main'
import {main as uniforms} from './examples/uniforms/main'
import {main as animation} from './examples/animation/main'
import {main as resize} from './examples/resize/main'
import {main as texture} from './examples/texture/main'
import {main as demo} from './examples/demo/main'
import {main as _3d} from './examples/3d/main'

import {setState} from 'gippy'

export const srcRecord = {
  helloTriangle,
  attributes,
  uniforms,
  animation,
  resize,
  texture,
  '3d': _3d,
  demo
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
