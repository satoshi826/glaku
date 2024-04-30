import {useEffect, useRef} from 'react'
import {OffscreenCanvasContext} from './context'

export function OffscreenCanvasProvider({children, worker}) {
  const workerRef = useRef<Worker | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const handlerRef = useRef(new Set<(v: unknown) => void>())
  const canvas = <canvas ref={canvasRef} style={{height: '100%', width: '100%', position: 'absolute'}}/>
  useEffect(() => {
    if (!workerRef.current && canvasRef.current) {
      console.log('connecting worker')
      const canvas = canvasRef.current
      const offscreenCanvas = canvas.transferControlToOffscreen()
      const {width, height} = canvas.getBoundingClientRect()
      offscreenCanvas.width = width
      offscreenCanvas.height = height
      workerRef.current = worker()
      workerRef.current!.postMessage({canvas: offscreenCanvas}, [offscreenCanvas])
      workerRef.current!.onmessage = ({data}: {data: unknown}) => {
        handlerRef.current.forEach((f) => f(data))
      }
    }
  }, [])
  const post = (m) => workerRef.current?.postMessage(m)
  const addListener = (f) => handlerRef.current.add(f)
  const removeListener = (f) => handlerRef.current.delete(f)
  return(
    <OffscreenCanvasContext.Provider value={{canvas, post, addListener, removeListener, ref: canvasRef}}>
      {children}
    </OffscreenCanvasContext.Provider>)
}