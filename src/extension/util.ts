
//  0     X              1 ∧ y
//  ┏━━━━━>                ┃
//  ┃          -->   -1 ━━━╇━━━＞ 1
//  ┃                      ┃   x
//  ∨ Y                 -1
//  screen              viewPort
export const screenToViewPort = (
  {offsetX, offsetY, clientWidth, clientHeight}:
  {offsetX: number, offsetY: number, clientWidth: number, clientHeight: number}) => {
  const x = 2 * (offsetX / clientWidth) - 1
  const y = - (2 * ((offsetY) / clientHeight) - 1)
  return {x, y}
}

export const calcAspectRatioVec = (width: number, height: number) => {
  const aspectRatio = width / height
  return aspectRatio > 1 ? [aspectRatio, 1] : [1, 1 / aspectRatio]
}

export const resizeObserver = (handler: ({width, height}: {width: number, height: number}) => void) =>
  new ResizeObserver(([entrie]) => {
    const {width, height} = entrie.contentRect
    handler({width, height})
  })