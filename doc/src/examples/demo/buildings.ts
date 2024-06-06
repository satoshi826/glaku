import {Model} from 'glaku'
import {range, random} from 'jittoku'

export const MAX_HEIGHT = 200
const CUBE_NUM_OF_SIDE = 100
const CUBE_MARGIN = 100
const AREA_SIZE = CUBE_NUM_OF_SIDE * CUBE_MARGIN

const cubeType = range(CUBE_NUM_OF_SIDE).flatMap((n) =>
  range(CUBE_NUM_OF_SIDE).map((m) => {
    const x = n * CUBE_MARGIN - AREA_SIZE / 2
    const y = m * CUBE_MARGIN - AREA_SIZE / 2
    const r = Math.sqrt(x * x + y * y)
    if (r < 3000 && random(0, 10) > 6) {
      return {[`${x}_${y}`]: true}
    }else if (r > 3000 && random(0, 10) > 4) {
      return {[`${x}_${y}`]: false}
    }
  })
).reduce((acc, cur) => {
  if (cur) acc = {...acc, ...cur}
  return acc
}, {})

export const buildings = range(CUBE_NUM_OF_SIDE).flatMap((n) =>
  range(CUBE_NUM_OF_SIDE).flatMap((m) => {
    const x = n * CUBE_MARGIN - AREA_SIZE / 2
    const y = m * CUBE_MARGIN - AREA_SIZE / 2
    let zScale = random(10, MAX_HEIGHT * 0.5)

    const isBig = random(0, 10) > 9.8
    const isSmall = cubeType![`${x}_${y}`] === true
    const isVoid = cubeType![`${x}_${y}`] === false

    if (isVoid) return []

    zScale = random(10, isBig ? (Math.abs(x) + Math.abs(y)) / 12 : 100)

    if (isSmall) {
      return [
        new Model({
          position: [x, zScale / 2, y],
          scale   : [random(5, 30), random(5, 40), random(5, 30)]
        }),
        new Model({
          position: [x + CUBE_MARGIN / 2, zScale / 2, y],
          scale   : [random(5, 30), random(5, 40), random(5, 30)]
        }),
        new Model({
          position: [x, zScale / 2, y + CUBE_MARGIN / 2],
          scale   : [random(5, 30), random(5, 40), random(5, 30)]
        }),
        new Model({
          position: [x + CUBE_MARGIN / 2, zScale / 2, y + CUBE_MARGIN / 2],
          scale   : [random(5, 30), random(5, 40), random(5, 30)]
        })
      ]
    }
    return new Model({
      position: [x, zScale, y],
      scale   : [random(20, 50), zScale, random(20, 50)]
    })
  })
)
