import {main as helloTriangle} from './helloTriangle/main'
import {main as attributes} from './attributes/main'
import {main as uniforms} from './uniforms/main'
import {main as animation} from './animation/main'
import {main as resize} from './resize/main'
import {main as texture} from './texture/main'
import {main as GPGPU} from './GPGPU/main'
import {main as _3d} from './3D/main'
import {main as instancing} from './instancing/main'
import {main as frameBuffer} from './frameBuffer/main'
import {main as gameOfLife} from './gameOfLife/main'
import {main as particle} from './particle/main'
import {main as wave} from './wave/main'
import {main as fluid} from './fluid/main'
import {main as cyberpunk} from './cyberpunk/main'

import {imageState, mouseState, resizeState, targetState, zoomState} from './state'
import {keys} from 'jittoku'

const srcRecord = {
  helloTriangle,
  attributes,
  uniforms,
  animation,
  resize,
  texture,
  frameBuffer,
  '3D': _3d,
  particle,
  instancing,
  GPGPU,
  gameOfLife,
  wave,
  fluid,
  cyberpunk
} as const
type SrcType = keyof typeof srcRecord

export const examples = keys(srcRecord)

let canvas: OffscreenCanvas | null = null
let pr: number = 1

onmessage = async({data}) => {
  const {canvas : offscreenCanvas, pixelRatio, src, state} = data
  if (offscreenCanvas) canvas = offscreenCanvas as OffscreenCanvas
  if (pixelRatio) pr = pixelRatio
  if (src) {
    srcRecord[src as SrcType](canvas!, pr)
  }
  if (state) {
    if (state.resize) resizeState.set(state.resize)
    if (state.mouse) mouseState.set(state.mouse)
    if (state.target) targetState.set(state.target)
    if (state.zoom) zoomState.set(state.zoom)
    if (state.image) imageState.set(state.image)
  }
}

export default {}
