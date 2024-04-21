import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {OffscreenCanvasProvider} from './OffscreenCanvas/OffscreenCanvasProvider.tsx'
import Worker from './worker?worker'
import {ThemeRoot} from './theme/ThemeRoot.tsx'
import {CssBaseline} from '@mui/material'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeRoot>
      <CssBaseline/>
      <OffscreenCanvasProvider worker={() => new Worker() as Worker}>
        <App />
      </OffscreenCanvasProvider>
    </ThemeRoot>
  </React.StrictMode>
)
