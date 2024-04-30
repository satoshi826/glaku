import {useEffect, useRef} from 'react'
import Worker from '../../worker?worker'

const getCanvas = (ref) => <canvas key={Date.now()} ref={ref} style={{height: '100%', width: '100%', position: 'absolute'}}/>

export function Canvas({src}) {

  const workerRef = useRef<Worker | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const canvas = getCanvas(canvasRef)

  const handlerRef = useRef(new Set<(v: unknown) => void>())
  useEffect(() => {
    console.log(workerRef.current)
    console.log(canvasRef.current)
    if (!workerRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const offScreenCanvas = canvas.transferControlToOffscreen()
      console.log('connecting worker')
      const {width, height} = canvas.getBoundingClientRect()
      offScreenCanvas.width = width
      offScreenCanvas.height = height
      workerRef.current = new Worker() as Worker
      workerRef.current!.postMessage({canvas: offScreenCanvas}, [offScreenCanvas])
      workerRef.current!.postMessage({src})
      workerRef.current!.onmessage = ({data}: {data: unknown}) => {
        handlerRef.current.forEach((f) => f(data))
      }
    }
    return () => {
      console.log('cleanup')
      workerRef.current.terminate()
      workerRef.current = null
    }
  }, [])

  return (
    <div id='canvas_wrapper' style={{flexGrow: 1, position: 'relative'}}>
      {canvas}
    </div>
  )
}

