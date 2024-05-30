import {Camera, Loop, Model, Vao, box, setHandler, plane, RGBA32F, Core, Renderer} from 'glaku'
import {random, range} from 'jittoku'
import {prepass} from './prepass'
import {shade} from './shading'
import {postEffect} from './postEffect'

export const CUBE_NUM = 11000
export const LIGHT_NUM = 50
export const MAX_HEIGHT = 200

const models = range(CUBE_NUM).map(() => {
  let zScale = random(10, MAX_HEIGHT * 0.5)
  zScale = zScale > MAX_HEIGHT * 0.5 * 0.99 ? zScale + random(0, 100) : zScale
  return new Model({
    position: [random(-5000, 5000), zScale, random(-5000, 5000)],
    scale   : [random(10, 50), zScale, random(10, 50)]
  })
})

const lightPositions = range(LIGHT_NUM).flatMap(() => [random(-1500, 1500), random(50, 100), random(-1500, 1500)])

const camera = new Camera({lookAt: [0, 120, 0], position: [0, 200, 0], near: 100, far: 8000, fov: 60})

export const main = async(canvas: HTMLCanvasElement | OffscreenCanvas, pixelRatio: number) => {
  const core = new Core({
    canvas,
    pixelRatio,
    resizeListener: (fn) => setHandler('resize', fn),
    options       : ['DEPTH_TEST', 'CULL_FACE']
  })

  const preRenderer = new Renderer(core, {frameBuffer: [RGBA32F, RGBA32F, RGBA32F]})
  const shadeRenderer = new Renderer(core, {frameBuffer: [RGBA32F]})
  const renderer = new Renderer(core, {backgroundColor: [0.08, 0.14, 0.2, 1.0]})

  const planeVao = new Vao(core, {
    id: 'plane',
    ...plane()
  })

  const boxVao = new Vao(core, {
    id                 : 'box',
    instancedAttributes: ['a_mMatrix'],
    maxInstance        : CUBE_NUM,
    ...box()
  })

  const prepassProgram = prepass(core)
  boxVao.setInstancedValues({a_mMatrix: models.flatMap(({matrix: {m}}) => m)})

  const shadeProgram = shade(core, LIGHT_NUM, preRenderer)
  shadeProgram.set({u_lightPosition: lightPositions})

  const postEffectProgram = postEffect(core, shadeRenderer)

  setHandler('resize', ({width, height}: {width: number, height: number} = {width: 100, height: 100}) => {
    camera.aspect = width / height
  })

  const animation = new Loop({callback: ({elapsed}) => {
    renderer.clear()
    preRenderer.clear()
    shadeRenderer.clear()

    camera.position = [2000 * Math.cos(elapsed / 3000), 400, 1000 * Math.sin(elapsed / 3000)]
    camera.update()

    prepassProgram.set({u_vpMatrix: camera.matrix.vp})
    shadeProgram.set({u_cameraPosition: camera.position})

    preRenderer.render(boxVao, prepassProgram)
    shadeRenderer.render(planeVao, shadeProgram)
    renderer.render(planeVao, postEffectProgram)
  }})
  animation.start()
}

//----------------------------------------------------------------