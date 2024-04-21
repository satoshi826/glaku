import {Drawer} from '@mui/material'
import {useAtom} from 'jotai'
import {useIsXs} from '../../theme/hooks'
import {SIDEBAR_WIDTH, sidebarOpenAtom} from '..'
import {SidebarContent} from './SidebarContent'

export function Sidebar() {
  const [open, setOpen] = useAtom(sidebarOpenAtom)
  const isXs = useIsXs()
  const variant = isXs ? 'temporary' : 'persistent'
  return (
    <Drawer open={open} onClose={() => setOpen(false)} variant={variant}
      sx={({
        transitions : {duration : {enteringScreen, leavingScreen}, easing: {easeIn, easeOut}},
        zIndex : {appBar},
        breakpoints
      }) => ({
        '.MuiPaper-root'      : {width: SIDEBAR_WIDTH, zIndex: appBar - 1, backgroundImage: 'unset'},
        [breakpoints.up('sm')]: {
          '&.MuiDrawer-root': {
            transition: 'width ' + (open ? enteringScreen : leavingScreen) + 'ms ' + (open ? easeOut : easeIn),
            width     : open ? SIDEBAR_WIDTH : 0
          },
          '&.MuiDrawer-docked': {position: 'relative'},
          '.MuiPaper-root'    : {position: 'absolute', width: SIDEBAR_WIDTH}
        }
      })}
    >
      <SidebarContent/>
    </Drawer>
  )
}