
type Callback = (obj: {unix: number, delta: number, drawTime: number, elapsed: number}) => void

export class Loop {
  callback: Callback
  interval: null | number
  unix: number
  delta: number
  drawTime: number
  startTime: number
  elapsed: number
  animeCallback: () => void
  constructor({callback, interval}: {callback: Callback, interval?: number}) {

    this.callback = callback
    this.interval = interval ?? null
    this.unix = 0
    this.delta = 0
    this.drawTime = 0
    this.startTime = 0
    this.elapsed = 0

    const recordTime = () => {
      const nowTime = performance.now()
      this.delta = nowTime - this.unix
      this.unix = nowTime
      this.elapsed = nowTime - this.startTime
    }

    let tmpTime
    this.animeCallback = () => {
      tmpTime = performance.now()
      recordTime()
      callback({unix: this.unix, delta: this.delta, drawTime: this.drawTime, elapsed: this.elapsed})
      this.drawTime = performance.now() - tmpTime
      if (this.interval) setTimeout(this.animeCallback, this.interval)
      else requestAnimationFrame(this.animeCallback)
    }
  }

  start = () => {
    this.startTime = performance.now()
    this.animeCallback()
  }
}