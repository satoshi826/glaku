
type Attribute = {
  a_position: number[],
  a_normal: number[],
  a_textureCoord: number[],
}

export type Shape = {
  attributes: Attribute,
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
      a_textureCoord: [
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

export const box = (): Shape => {
  return {
    attributes: {
      a_position: [
        1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, // v0-v1-v2-v3 front
        1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, // v0-v3-v4-v5 right
        1, 1, 1, 1, 1, -1, -1, 1, -1, -1, 1, 1, // v0-v5-v6-v1 top
        -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, // v1-v6-v7-v2 left
        -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, // v7-v4-v3-v2 bottom
        1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, -1], // v4-v7-v6-v5 back
      a_normal: [
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, // v0-v1-v2-v3 front
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v0-v3-v4-v5 right
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, // v0-v5-v6-v1 top
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, // v1-v6-v7-v2 left
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, // v7-v4-v3-v2 bottom
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1], // v4-v7-v6-v5 back
      a_textureCoord: [
        1, 1, 0, 1, 0, 0, 1, 0, // v0-v1-v2-v3 front
        0, 1, 0, 0, 1, 0, 1, 1, // v0-v3-v4-v5 right
        1, 0, 1, 1, 0, 1, 0, 0, // v0-v5-v6-v1 top
        1, 1, 0, 1, 0, 0, 1, 0, // v1-v6-v7-v2 left
        0, 0, 1, 0, 1, 1, 0, 1, // v7-v4-v3-v2 bottom
        0, 0, 1, 0, 1, 1, 0, 1] // v4-v7-v6-v5 back
    },
    index: [0, 1, 2, 0, 2, 3, // front
      4, 5, 6, 4, 6, 7, // right
      8, 9, 10, 8, 10, 11, // top
      12, 13, 14, 12, 14, 15, // left
      16, 17, 18, 16, 18, 19, // bottom
      20, 21, 22, 20, 22, 23] // back
  }
}