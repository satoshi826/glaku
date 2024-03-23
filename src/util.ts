
//  0     X              1 ∧ y
//  ┏━━━━━>                ┃
//  ┃          ->    -1 ━━━╇━━━＞ 1
//  ┃                      ┃   x
//  ∨ Y                 -1

export const screenToViewPort = (
  {offsetX, offsetY, clientWidth, clientHeight}:
  {offsetX: number, offsetY: number, clientWidth: number, clientHeight: number}) => {
  const x = 2 * (offsetX / clientWidth) - 1
  const y = - (2 * ((offsetY) / clientHeight) - 1)
  return {x, y}
}

export const screenToViewPortAspectRatio = (
  {offsetX, offsetY, clientWidth, clientHeight}:
  {offsetX: number, offsetY: number, clientWidth: number, clientHeight: number}) => {
  const x = 2 * (offsetX / clientWidth) - 1
  const y = - (2 * ((offsetY) / clientHeight) - 1)
  const aspectRatio = clientWidth / clientHeight
  const ax = aspectRatio > 1 ? aspectRatio * x : x
  const ay = aspectRatio < 1 ? (1 / aspectRatio) * y : y
  return {x: ax, y: ay}
}

export const resizeObserver = (handler: ({width, height}: {width: number, height: number}) => void) =>
  new ResizeObserver(([entrie]) => {
    const {width, height} = entrie.contentRect
    handler({width, height})
  })