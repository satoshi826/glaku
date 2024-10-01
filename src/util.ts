// "This file is an inline version of the util library 'jittoku'."
// https://github.com/satoshi826/jittoku

export type Key = string | number | symbol

export type ValueOf<T> = T[keyof T]

export type PickType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
}

export type Falsy = false | 0 | '' | null | undefined

export type Truthy<T> = T extends Falsy ? never : T

export type PartialRecord<K extends Key, T> = {
  [P in K]?: T
}

export const values = <T>(obj: Record<Key, T>) => Object.values(obj)

export const keys = <T extends Key>(obj: Record<T, unknown>) : T[] => Object.keys(obj) as T[]

export const isObject = (v: unknown): v is object => v !== null && typeof v === 'object'

export const isNullish = (v: unknown) : v is null | undefined => v === null || v === undefined

export const oLength = (obj: object): number => Object.keys(obj).length

export const oForEach = <TKey extends Key, TValue>
  (object: Record<TKey, TValue>, f: (keyValue: [TKey, TValue], index: number) => void) => {
  (Object.entries(object) as Array<[TKey, TValue]>).forEach(f)
}

export const oForEachK = <T extends Key>
  (object: Record<T, unknown>, f: (key: T, index: number) => void) => {
  (Object.keys(object) as T[]).forEach(f)
}

export const oForEachV = <T>
  (object: Record<Key, T>, f: (value: T, index: number) => void) => {
  Object.values(object).forEach(f)
}

export const oMap = <TKey extends Key, TValue, K>
  (object: Record<TKey, TValue>, f: (keyValue: [TKey, TValue], index: number) => K): K[] =>
    (Object.entries(object) as Array<[TKey, TValue]>).map(f)

export const oReduce = <TKey extends Key, TValue, Acc, Return extends Acc>
  (
    object: Record<TKey, TValue>,
    f: (
      acc: Acc,
      cur: [TKey, TValue],
      index: number,
      arr: Array<[TKey, TValue]>
    )
    => Return, int: Acc): Return =>
    (Object.entries(object) as Array<[TKey, TValue]>).reduce(f, int) as Return

export const oMapO = <TKey extends Key, TValue, K extends Key, U>
  (object: Record<TKey, TValue>, f: (keyValue: [TKey, TValue], index: number) => [K, U]) =>
    Object.entries(object).reduce((obj, [k, v], i) => {
      const [newK, newV] = f([k, v] as [TKey, TValue], i)
      obj[newK] = newV
      return obj
    }, {} as Record<K, U>)

export const aToO = <T, K extends Key, U>
  (array: T[], f: (item: T, index: number) => [K, U]): Record<K, U> => array.reduce((obj, cur, i) => {
    const [k, v] = f(cur, i)
    obj[k] = v
    return obj
  }, {} as Record<K, U>)

export const partition = <T>
  (array: T[], f: (cur: T, index: number) => unknown) => array.reduce<[T[], T[]]>((res, cur, i) => {
    res[f(cur, i) ? 0 : 1].push(cur)
    return res
  }, [[], []])

export const shake = <TKey extends Key, TValue>
  (object: Record<TKey, TValue | null | undefined>): Record<TKey, TValue> => Object?.keys(object).reduce((obj, cur) => {
    if (!(object[cur as TKey] === undefined || object[cur as TKey] === null)) obj[cur as TKey] = object[cur as TKey] as TValue
    return obj
  }, {} as Record<TKey, TValue>)

export const range = (num: number) => [...Array(num).keys()]

export const times = (i :number, f: (index: number) => void) => {
  for (let index = 0; index < i; index++) f(index)
}

export const unique = <T>(array: T[]) => [...new Set(array)]

export const arrayed = <T>(v: T | T[]) => Array.isArray(v) ? v : [v]

export const firstEntry = <TKey extends Key, TValue>(object : Record<TKey, TValue>) => Object.entries(object)[0] as [TKey, TValue]

export const pick = <T extends object, K extends ValueOf<T>>
  (obj : T, picker : (k: keyof T, v : ValueOf<T>) => v is K) : PickType<T, K> =>
    oReduce(obj, (acc, [k, v]) => {
      if (picker(k, v)) acc[k] = v
      return acc
    }, {} as PickType<T, K>)

export const random = (min = 0, max = 1) => Math.random() * (max - min) + min