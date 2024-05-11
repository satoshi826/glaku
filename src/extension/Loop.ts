
type Callback = (obj: { delta: number, drawTime: number, elapsed: number}) => void

export class Loop {
  callback: Callback
  interval: null | number
  delta: number
  drawTime: number
  startTime: number
  elapsed: number
  animeCallback: () => void
  constructor({callback, interval}: {callback: Callback, interval?: number}) {

    this.callback = callback
    this.interval = interval ?? null
    this.delta = 0
    this.drawTime = 0
    this.startTime = 0
    this.elapsed = 0

    const recordTime = () => {
      const nowTime = performance.now()
      this.delta = nowTime - this.elapsed
      this.elapsed = nowTime
    }

    let tmpTime
    this.animeCallback = () => {
      tmpTime = performance.now()
      recordTime()
      callback({delta: this.delta, drawTime: this.drawTime, elapsed: this.elapsed})
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