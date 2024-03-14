import {useState} from 'react'
import {useCanvasListener, useOffscreenCanvas} from './OffscreenCanvas/hooks'

function App() {
  const [count, setCount] = useState(0)
  const {canvas, post} = useOffscreenCanvas()
  const handleClick = () => post({state: 1})
  useCanvasListener((data) => setCount(data))
  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <button onClick={handleClick}>{count}</button>
      <h2>React + OffScreenCanvas + gippy</h2>
      <div id='canvas_wrapper' style={{flexGrow: 1, position: 'relative'}}>
        {canvas}
      </div>
    </div>
  )
}

export default App
