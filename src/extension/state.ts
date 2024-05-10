import {oForEach} from 'jittoku'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fn = (value: any) => any

const state: Record<string, {value?: unknown, handler?: Set<Fn>}> = {}

export const getState = (key: string) => {
  return state?.[key]?.value
}

export const setState = async<T>(object: Record<string, T>) => {
  oForEach(object, ([k, v]) => {
    state[k] ??= {}
    state[k].value = v
    state[k].handler?.forEach(async(f) => f(v))
  })
}

export const setHandler = (key: string, f: Fn) => {
  state[key] ??= {}
  state[key].handler ??= new Set()
  state[key].handler!.add(f)
  f(state[key].value)
  return () => state[key].handler?.delete(f)
}