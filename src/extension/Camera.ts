import {Vec3, create, lookAt, multiply, perspective} from './matrix'

export class Camera {
  matrix = {
    v : create(),
    p : create(),
    vp: create()
  }
  position: Vec3
  lookAt: Vec3
  up: Vec3
  fov: number
  near: number
  far: number
  aspect: number
  constructor({
    position = [0, 0, 10],
    lookAt = [0, 0, 0],
    up = [0, 1, 0],
    fov = 60,
    near = 0.1,
    far = 100,
    aspect = 1
  }: {
    position?: Vec3
    lookAt?: Vec3
    up?: Vec3
    fov?: number
    near?: number
    far?: number
    aspect?: number
  }) {
    this.position = position
    this.lookAt = lookAt
    this.up = up
    this.fov = fov
    this.near = near
    this.far = far
    this.aspect = aspect
    this.update()
  }

  update() {
    lookAt(this.position, this.lookAt, this.up, this.matrix.v)
    perspective(this.fov, this.aspect, this.near, this.far, this.matrix.p)
    multiply(this.matrix.p, this.matrix.v, this.matrix.vp)
  }
}
