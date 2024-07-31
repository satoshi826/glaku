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
      const _name = name.replaceAll(' ', '')
      console.log(_name)
      const Page = lazy(() => import(`./${type}/${_name}/Page.tsx`))
      return (
        <Route path={_name} key={_name}>
          <Suspense fallback={<LinearProgress sx={{width: '100%', height: 2}}/>}>
            <Page name={_name}/>
          </Suspense>
        </Route>
      )
    })
  )
}

export default App
