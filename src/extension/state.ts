type Handler<T> = (value: T) => void
export class State<T> {
  value : T
  handler : Set<Handler<T>>
  constructor(init : T) {
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
  on(handler: Handler<T>) {
    this.handler.add(handler)
    handler(this.value)
    const off = () => {
      this.handler.delete(handler)
    }
    return off
  }
}