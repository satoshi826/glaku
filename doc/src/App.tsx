import {Suspense, lazy, useMemo} from 'react'
import {Redirect, Route, Switch} from 'wouter'
import {LinearProgress} from '@mui/material'
import {Frame} from './frame'
import {pages as pagesFn} from './pages'
import {Root} from './Root'

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
    <Switch>
      {pages.map(({type, name}) => {
        const Page = lazy(() => import(`./${type}/${name}/Page.tsx`).catch(() => null))
        return (
          <Route path={name} key={name}>
            <Suspense fallback={<LinearProgress sx={{width: '100%', height: 2}}/>}>
              <Page name={name}/>
            </Suspense>
          </Route>
        )
      })}
      <Route path="/" >
        <Root/>
      </Route>
      <Route >
        <Redirect replace to="/" />
      </Route>
    </Switch>
  )
}

export default App
