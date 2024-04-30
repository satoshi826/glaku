import {Canvas} from './Canvas'
import {Frame} from './frame'
import {pages} from './pages'
import {Suspense, lazy} from 'react'
import {Route} from 'wouter'

function App() {
  return (
    <Frame >
      <Pages/>
      {/* <Canvas/> */}
    </Frame>
  )
}

function Pages() {
  return (
    pages.map(({type, name}) => {
      const Page = lazy(() => import(`./${type}/${name}/Page.tsx`))
      return (
        <Route path={name} key={name}>
          <Suspense fallback={null}>
            <Page />
          </Suspense>
        </Route>
      )
    })
  )
}

export default App
