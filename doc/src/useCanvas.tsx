import {resizeObserver, screenToViewPort} from 'glaku'
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef} from 'react'
import {HEADER_HEIGHT} from './frame/Header/Header'

export type CanvasProps = { src: string; state?: object}

export type useCanvasArgs = {Worker: new () => Worker, style?: string, id?: string}
export type useCanvasReturns = ReturnType<typeof useCanvas>

export function useCanvas({Worker, style = '', id = ''} :useCanvasArgs) {

  const workerRef = useRef<Worker | null>(null)
  const handlerRef = useRef(new Set<(v: unknown) => void>())
  const coverRef = useRef<HTMLDivElement | null>(null)

  // eslint-disable-next-line
  const post = useCallback((...args: any[]) => workerRef.current?.postMessage(...args), [])

  useLayoutEffect(() => {
    const wrapperEl = document.getElementById('canvas_wrapper_' + id)
    const canvasEl = document.createElement('canvas')
    canvasEl.id = 'canvas_' + id
    canvasEl.setAttribute('style', 'position: absolute; height: 100%; width: 100%; zIndex: 0;' + style)
    canvasEl.setAttribute('name', 'canvas')
    wrapperEl?.appendChild(canvasEl)
    const offScreenCanvas = canvasEl.transferControlToOffscreen()
    const {width, height} = canvasEl.getBoundingClientRect()
    offScreenCanvas.width = width
    offScreenCanvas.height = height
    console.debug('connecting worker')
    workerRef.current = new Worker() as Worker
    post({canvas: offScreenCanvas, pixelRatio: devicePixelRatio}, [offScreenCanvas])
    workerRef.current!.onmessage = ({data}: {data: unknown}) => handlerRef.current.forEach((f) => f(data))
    return () => {
      console.debug('terminate worker')
      document.getElementsByName('canvas').forEach(el => el.remove())
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  const canvas = useMemo(() => <div id={'canvas_wrapper_' + id} ref={coverRef} style={{flexGrow: 1, position: 'relative'}} />, [])
  return {canvas, post, ref: coverRef}
}

export function useCanvasPointer({post, ref} : Omit<useCanvasReturns, 'canvas'>) {
  const handleMouseMove = ({offsetX, offsetY, target}: MouseEvent) => {
    const {clientWidth, clientHeight} = target as HTMLElement
    const {x, y} = screenToViewPort({offsetX, offsetY, clientWidth, clientHeight})
    post({state: {mouse: {x, y}}})
  }

  const handleTouchMove = ({changedTouches, touches} : TouchEvent) => {
    if (touches.length === 1) {
      const touch = changedTouches[0]
      const {clientX, clientY, target} = touch
      const {clientWidth, clientHeight} = target as HTMLElement
      const {x, y} = screenToViewPort({offsetX: clientX, offsetY: clientY - HEADER_HEIGHT, clientWidth, clientHeight})
      post({state: {mouse: {x, y}}})
    }
  }

  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener('mousemove', handleMouseMove, {passive: true})
      ref.current.addEventListener('touchmove', handleTouchMove, {passive: true})
    }
    return () => {
      if (ref.current) {
        ref.current.removeEventListener('mousemove', handleMouseMove)
        ref.current.removeEventListener('touchmove', handleTouchMove)
      }
    }
  }, [ref])
}

export function useCanvasResize({post, ref} : Omit<useCanvasReturns, 'canvas'>) {
  const sendResize = resizeObserver(({width, height}) => post({state: {resize: {width, height}}}))
  useEffect(() => {
    if (ref.current) {
      sendResize.observe(ref.current)
    }
    return () => {
      if (ref.current) {
        sendResize.unobserve(ref.current)
      }
    }
  }, [ref])
}