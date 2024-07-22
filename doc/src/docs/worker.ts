import {resizeState} from '../examples/state'
import {main1} from './tutorial/main1'

onmessage = async({data}) => {
  const {canvas : offscreenCanvas, resize} = data
  if (offscreenCanvas) {
    main1(offscreenCanvas)
  }
  if (resize) {
    resizeState.set(resize)
  }
}

export default {}
