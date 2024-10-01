import {Model, Vec3} from 'glaku'
import {SCALE} from './main'

const range = (num: number) => [...Array(num).keys()]
const random = (min = 0, max = 1) => Math.random() * (max - min) + min

const MAX_LIGHTS = 16

export const getBuildings = () => {

  const MAX_HEIGHT = 140 * SCALE
  const CUBE_NUM_OF_SIDE = 150
  const CUBE_MARGIN = 100 * SCALE
  const AREA_SIZE = CUBE_NUM_OF_SIDE * CUBE_MARGIN
  const lightCubes : Model[] = []

  const rangeCube = range(CUBE_NUM_OF_SIDE)

  const cubeType = rangeCube.reduce((acc, n) => {
    rangeCube.forEach((m) => {
      const x = n * CUBE_MARGIN - AREA_SIZE / 2
      const y = m * CUBE_MARGIN - AREA_SIZE / 2
      if (random(0, 10) > 8) acc[`${x}_${y}`] = true
    })
    return acc
  }
  , {} as Record<string, boolean>)


  const smallScale = () => [
    random(8 * SCALE, 30 * SCALE),
    random(4 * SCALE, 50 * SCALE),
    random(8 * SCALE, 30 * SCALE)
  ]

  return [rangeCube.flatMap((n) =>
    rangeCube.flatMap((m) => {
      const x = n * CUBE_MARGIN - AREA_SIZE / 2
      const y = m * CUBE_MARGIN - AREA_SIZE / 2

      if (n % 10 === 0 || m % 10 === 0)return []

      const isBig = random(0, 10) > 9.8
      const isSmall = !isBig && cubeType![`${x}_${y}`]
      const zScale = random(8 * SCALE, isBig ? (Math.abs(x) + Math.abs(y)) / 9 : MAX_HEIGHT)
      if (isSmall) {
        const scales = range(4).map(smallScale)
        return [
          new Model({
            position: [x, scales[0][1], y],
            scale   : scales[0] as Vec3
          }),
          new Model({
            position: [x + CUBE_MARGIN / 2, scales[1][1], y],
            scale   : scales[1] as Vec3
          }),
          new Model({
            position: [x, scales[2][1], y + CUBE_MARGIN / 2],
            scale   : scales[3] as Vec3
          }),
          new Model({
            position: [x + CUBE_MARGIN / 2, scales[3][2], y + CUBE_MARGIN / 2],
            scale   : scales[3] as Vec3
          })
        ]
      }

      const isLighted = isBig && random(0, 10) > 8.5 && lightCubes.length < MAX_LIGHTS && Math.sqrt(x * x + y * y) < AREA_SIZE * 0.35

      const model = new Model({
        position: [x, zScale, y],
        scale   : [
          random(20 * SCALE, isBig ? 160 * SCALE : 40 * SCALE),
          zScale,
          random(20 * SCALE, isBig ? 160 * SCALE : 40 * SCALE)
        ]
      })

      if (isLighted) {
        const lightPosition = [model.position![0], 2 * zScale + 52 * SCALE, model.position![2]]
        const lightCube = new Model({
          position: lightPosition as Vec3,
          scale   : [
            model.scale![0],
            40 * SCALE,
            model.scale![2]
          ]
        })
        lightCubes.push(lightCube)
      }

      return model
    })
  ), lightCubes] as const


}