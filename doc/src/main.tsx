import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {OffscreenCanvasProvider} from './OffscreenCanvas/OffscreenCanvasProvider.tsx'
import Worker from './worker?worker'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OffscreenCanvasProvider worker={() => new Worker() as Worker}>
      <App />
    </OffscreenCanvasProvider>
  </React.StrictMode>
)
