type Handler<T> = (value: T) => void
export class State<T> {
  init: T
  value : T
  handler : Set<Handler<T>>
  constructor(init : T) {
    this.init = init
    this.value = init
    this.handler = new Set()
  }
  get() {
    return this.value
  }
  set(value : T) {
    this.value = value
    this.handler.forEach(f => f(this.value))
  }
  off(handler: Handler<T>) {
    this.handler.delete(handler)
  }
  on(handler: Handler<T>) {
    this.handler.add(handler)
    handler(this.value)
    const off = () => {
      this.off(handler)
    }
    return off
  }
  clear() {
    this.handler = new Set<Handler<T>>()
    this.value = this.init
  }
}