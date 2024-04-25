import {main} from './examples/helloTriangle/src'

console.log('starting worker')
onmessage = async({data}) => {
  const {init} = data as {init: HTMLCanvasElement}
  if (init) {
    main(init)
  }
}

export default {}
