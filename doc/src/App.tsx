import {LinearProgress} from '@mui/material'
import {Frame} from './frame'
import {pages as pagesFn} from './pages'
import {Suspense, lazy, useMemo} from 'react'
import {Route} from 'wouter'

function App() {
  return (
    <Frame >
      <Pages/>
    </Frame>
  )
}

function Pages() {
  const pages = useMemo(() => pagesFn(), [])
  return (
    pages.map(({type, name}) => {
      const Page = lazy(() => import(`./${type}/${name}/Page.tsx`))
      return (
        <Route path={name} key={name}>
          <Suspense fallback={<LinearProgress sx={{width: '100%', height: 2}}/>}>
            <Page name={name}/>
          </Suspense>
        </Route>
      )
    })
  )
}

export default App
