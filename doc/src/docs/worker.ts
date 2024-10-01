import {resizeState} from '../examples/state'
import {main1} from './tutorial/main1'
import {main2} from './tutorial/main2'
import {main3} from './tutorial/main3'

const srcMap = {
  1: main1,
  2: main2,
  3: main3
}
let canvas : OffscreenCanvas

onmessage = async({data}) => {
  const {canvas : offscreenCanvas, resize, src} = data
  if (offscreenCanvas) canvas = offscreenCanvas
  if (src) srcMap[src as '1' | '2' | '3'](canvas)
  if (resize) resizeState.set(resize)
}

export default {}
