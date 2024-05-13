import {Core, Loop, Renderer, ResizeArgs, calcAspectRatioVec, setHandler} from 'gippy'
import {getGpgpu} from './gpgpu'
import {getProgram} from './program'

export const main = (canvas: HTMLCanvasElement | OffscreenCanvas) => {

  const core = new Core({canvas, resizeListener: (fn) => setHandler('resize', fn)})
  const renderer = new Renderer(core, {backgroundColor: [0, 0, 0, 1]})

  const gpgpu = getGpgpu(core)
  const program = getProgram(core, gpgpu)

  setHandler('resize', ({width, height}: ResizeArgs = {}) => {
    const ar = width && height ? calcAspectRatioVec(width, height) : [1, 1]
    gpgpu.set({u_aspectRatio: ar})
  })

  setHandler('mouse', ({x, y}: {x: number, y: number} = {x: 0, y: 0}) => {
    gpgpu.set({u_origin: [x, y]})
  })

  const animation = new Loop({callback: ({delta, elapsed}) => {
    renderer.clear()
    gpgpu.set({u_delta: delta, u_unix: elapsed})
    gpgpu.run()
    renderer.render(gpgpu.vao, program)
  }})

  animation.start()

  // setInterval(() => self.postMessage({
  //   drawTime: animation.drawTime.toFixed(2) + ' ms',
  //   fps     : (1000 / animation.delta).toFixed(2)
  // }), 200)

}