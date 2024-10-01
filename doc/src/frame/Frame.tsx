import {Stack} from '@mui/material'
import {atom} from 'jotai'
import {Header} from './Header/Header'
import {Sidebar} from './Sidebar/Sidebar'
import {themeObject} from '../theme/ThemeRoot'

export const sidebarOpenAtom = atom(window.innerWidth > themeObject.breakpoints.values.sm)
export const SIDEBAR_WIDTH = 200

export function Frame({children}: React.PropsWithChildren) {
  return (
    <Stack height='100dvh'>
      <Header/>
      <Stack direction='row' flexGrow={1}>
        <Sidebar/>
        {children}
      </Stack>
    </Stack>
  )
}

