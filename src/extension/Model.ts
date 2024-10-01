import {Vec3, create, rotate, translate, scale as mScale, identity} from './matrix'

type Rotation = {
  angle: number
  axis: Vec3
}

export class Model {
  matrix = {m: create()}
  position?: Vec3
  rotation: Rotation
  scale?: Vec3
  constructor({position, rotation = {angle: 0, axis: [0, 1, 0]}, scale}: {position?: Vec3, rotation?: Rotation, scale?: Vec3}) {
    this.position = position
    this.rotation = rotation
    this.scale = scale
    this.update()
  }

  update() {
    const {position, rotation: {angle, axis}, scale} = this
    identity(this.matrix.m)
    if (position) translate(this.matrix.m, position, this.matrix.m)
    if (angle) rotate(this.matrix.m, angle, axis, this.matrix.m)
    if (scale) mScale(this.matrix.m, scale, this.matrix.m)
  }
}
