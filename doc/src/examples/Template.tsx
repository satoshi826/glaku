import {Fab, Icon} from '@mui/material'
import {Canvas} from './Canvas'

export function Template({src}: {src: string}) {
  return (
    <>
      <Canvas src={src}/>
      <Fab sx={{position: 'absolute', right: 16, bottom: 16}}>
        <Icon>code</Icon>
      </Fab>
    </>
  )
}