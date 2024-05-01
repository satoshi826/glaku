import {useEffect, useLayoutEffect, useRef} from 'react'
import Worker from '../worker?worker'
import {resizeObserver, screenToViewPortAspectRatio} from '../../../src'

export function Canvas({src}) {

  const workerRef = useRef<Worker | null>(null)
  const handlerRef = useRef(new Set<(v: unknown) => void>())
  const coverRef = useRef<HTMLDivElement | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const post = (...args: any[]) => workerRef.current?.postMessage(...args)

  useLayoutEffect(() => {
    const wrapperEl = document.getElementById('canvas_wrapper')
    const canvasEl = document.createElement('canvas')
    canvasEl.setAttribute('style', 'position: absolute; height: 100%; width: 100%; zIndex: 0;')
    canvasEl.setAttribute('name', 'canvas')
    wrapperEl?.appendChild(canvasEl)
    const offScreenCanvas = canvasEl.transferControlToOffscreen()
    const {width, height} = canvasEl.getBoundingClientRect()
    offScreenCanvas.width = width
    offScreenCanvas.height = height
    console.log('connecting worker')
    workerRef.current = new Worker() as Worker
    post({canvas: offScreenCanvas}, [offScreenCanvas])
    post({src})
    workerRef.current!.onmessage = ({data}: {data: unknown}) => handlerRef.current.forEach((f) => f(data))
    return () => {
      console.log('terminate worker')
      document.getElementsByName('canvas').forEach(el => el.remove())
      workerRef.current?.terminate()
      workerRef.current = null
    }
  })

  const sendResize = resizeObserver(({width, height}) => post({state: {resize: {width, height}}}))
  useEffect(() => {
    coverRef.current && sendResize.observe(coverRef.current)
    return () => {
      coverRef.current && sendResize.unobserve(coverRef.current)
    }
  }, [coverRef])

  const handleMouseMove = (e: React.MouseEvent) => {
    const {offsetX, offsetY, target} = e.nativeEvent
    const {clientWidth, clientHeight} = target as HTMLElement
    const {x, y} = screenToViewPortAspectRatio({offsetX, offsetY, clientWidth, clientHeight})
    post({state: {mouse: {x, y}}})
  }

  return (
    <div id='canvas_wrapper' ref={coverRef} style={{flexGrow: 1, position: 'relative'}} onMouseMove={handleMouseMove}/>
  )
}

