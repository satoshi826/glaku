import {useEffect, useState} from 'react'
import {useCanvasListener, useOffscreenCanvas} from './OffscreenCanvas/hooks'
import {resizeObserver, screenToViewPortAspectRatio} from '../../src'

function App() {
  const [state, setState] = useState(null)
  const {canvas, post, ref} = useOffscreenCanvas()
  useCanvasListener((state) => setState(state))

  const sendResize = resizeObserver(({width, height}) => post({resize: {width, height}}))
  useEffect(() => {
    sendResize.observe(ref.current)
    return () => sendResize.unobserve(ref.current)
  }, [ref])

  const handleMouseMove = (e: React.MouseEvent) => {
    const {offsetX, offsetY, target} = e.nativeEvent
    const {clientWidth, clientHeight} = target as HTMLElement
    const {x, y} = screenToViewPortAspectRatio({offsetX, offsetY, clientWidth, clientHeight})
    post({mouse: {x, y}})
  }

  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#111', color: '#ddd'}}>
      <h2>React + OffScreenCanvas + gippy</h2>
      <div >fps: {state?.fps}</div>
      <div >drawTime: {state?.drawTime}</div>
      <div id='canvas_wrapper' style={{flexGrow: 1, position: 'relative'}}>
        {canvas}
        <div id='canvas_cover' style={{height: '100%', width: '100%', position: 'absolute'}} onMouseMove={handleMouseMove}/>
      </div>
    </div>
  )
}

export default App
