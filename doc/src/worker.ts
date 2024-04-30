import {main as helloTriangle} from './examples/helloTriangle/main'
import {main as attributes} from './examples/attributes/main'
import {main as demo} from './examples/demo/main'
import {setState} from '../../src'

const srcRecord = {
  helloTriangle,
  attributes,
  demo
}

console.log('starting worker')

let canvas: OffscreenCanvas | null = null

onmessage = async({data}) => {
  const {canvas : offscreenCanvas, src, state} = data
  if (offscreenCanvas) canvas = offscreenCanvas as OffscreenCanvas
  if (src) srcRecord[src](canvas)
  if (state) setState(state)
}

export default {}
