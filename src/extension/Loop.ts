
type LoopCallback = (obj: { delta: number, drawTime: number, elapsed: number}) => void

export class Loop {
  callback: LoopCallback
  interval: null | number
  delta: number = 0
  drawTime: number = 0
  startTime: number = 0
  elapsed: number = 0
  animeCallback: () => void
  constructor({callback, interval}: {callback: LoopCallback, interval?: number}) {
    this.callback = callback
    this.interval = interval ?? null
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