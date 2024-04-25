import {useEffect} from 'react'
import {useOffscreenCanvas} from './OffscreenCanvas/hooks'
import {resizeObserver, screenToViewPortAspectRatio} from '../../src'

export function Canvas() {
  const {canvas, post, ref} = useOffscreenCanvas()
  // const [state, setState] = useState(null)
  // useCanvasListener((state) => setState(state))

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
    <div id='canvas_wrapper' style={{flexGrow: 1, position: 'relative'}}>
      {canvas}
      <div id='canvas_cover' style={{height: '100%', width: '100%', position: 'absolute'}} onMouseMove={handleMouseMove}/>
    </div>
  )
}

