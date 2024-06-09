import {Model} from 'glaku'
import {range, random} from 'jittoku'
import {MAX_HEIGHT, SCALE} from './main'

export const getBuildings = () => {

  const CUBE_NUM_OF_SIDE = 100
  const CUBE_MARGIN = 100 * SCALE
  const AREA_SIZE = CUBE_NUM_OF_SIDE * CUBE_MARGIN

  const rangeCube = range(CUBE_NUM_OF_SIDE)

  const cubeType = rangeCube.flatMap((n) =>
    rangeCube.map((m) => {
      const x = n * CUBE_MARGIN - AREA_SIZE / 2
      const y = m * CUBE_MARGIN - AREA_SIZE / 2
      const r = Math.sqrt(x * x + y * y)
      if (r < 3000 * SCALE && random(0, 10) > 6) return {[`${x}_${y}`]: true}
      else if (r > 4000 * SCALE && random(0, 10) > 3) return {[`${x}_${y}`]: false}
    })
  ).reduce((acc, cur) => {
    if (cur) acc = {...acc, ...cur}
    return acc
  }, {})

  const smallScale = () => [
    random(5 * SCALE, 30 * SCALE),
    random(5 * SCALE, 40 * SCALE),
    random(5 * SCALE, 30 * SCALE)
  ]

  return rangeCube.flatMap((n) =>
    rangeCube.flatMap((m) => {
      const x = n * CUBE_MARGIN - AREA_SIZE / 2
      const y = m * CUBE_MARGIN - AREA_SIZE / 2

      const isBig = random(0, 10) > 9.9
      const isSmall = cubeType![`${x}_${y}`] === true
      const isVoid = cubeType![`${x}_${y}`] === false
      if (isVoid) return []
      let zScale = random(10 * SCALE, isBig ? (Math.abs(x) + Math.abs(y)) / 8 : MAX_HEIGHT)
      if (isSmall) {
        zScale = random(10 * SCALE, MAX_HEIGHT * 0.5)
        return [
          new Model({
            position: [x, zScale / 2, y],
            scale   : smallScale()
          }),
          new Model({
            position: [x + CUBE_MARGIN / 2, zScale / 2, y],
            scale   : smallScale()
          }),
          new Model({
            position: [x, zScale / 2, y + CUBE_MARGIN / 2],
            scale   : smallScale()
          }),
          new Model({
            position: [x + CUBE_MARGIN / 2, zScale / 2, y + CUBE_MARGIN / 2],
            scale   : smallScale()
          })
        ]
      }
      return new Model({
        position: [x, zScale, y],
        scale   : [random(20 * SCALE, isBig ? 100 * SCALE : 40 * SCALE), zScale, random(20 * SCALE, isBig ? 100 * SCALE : 40 * SCALE)]
      })
    })
  )


}