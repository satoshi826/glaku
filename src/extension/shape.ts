export type Shape = {
  attributes: {
    a_position: number[],
    a_normal: number[],
    a_texCoord: number[],
  }
  index: number[],
}

export const plane = (): Shape => {
  return {
    attributes: {
      a_position: [
        -1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
      ],
      a_normal: [
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0
      ],
      a_texCoord: [
        0.0, 1.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 0.0
      ]
    },
    index: [
      2, 1, 0,
      1, 2, 3
    ]
  }
}