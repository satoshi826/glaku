import {Fab, Icon} from '@mui/material'
import {Canvas} from './Canvas'

export default function Page() {
  return (
    <>
      <Canvas src={'helloTriangle'}/>
      <Fab sx={{position: 'absolute', right: 16, bottom: 16}}>
        <Icon>code</Icon>
      </Fab>
    </>
  )
}