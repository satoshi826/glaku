import {State} from 'glaku'

export const resizeState = new State({width: 0, height: 0})

export const mouseState = new State({x: 0, y: 0})

export const targetState = new State({x: 0, y: 0})

export const zoomState = new State(1)

export const imageState = new State<ImageBitmap | null>(null)


