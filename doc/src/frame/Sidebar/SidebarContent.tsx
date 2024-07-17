import {List, ListItem, ListItemButton, ListItemText, Stack} from '@mui/material'
import {Tabs} from '../../components/Tabs'
import {Link, useLocation, useRoute} from 'wouter'
import {PageType, pageTypes} from '../../pages'
import {sidebarOpenAtom} from '..'
import {useSetAtom} from 'jotai'
import {useIsXs} from '../../theme/hooks'
import {examples} from '../../examples/worker'

type Content = {
  type: 'section' | 'page',
  title: string
}

export const sidebarContents : Content[] = [
  {type: 'section', title: 'Getting started'},
  {type: 'page', title: 'introduction'},
  {type: 'page', title: 'tutorial'},
  {type: 'section', title: 'API'},
  {type: 'page', title: 'Core'},
  {type: 'page', title: 'Program'},
  {type: 'page', title: 'VAO'},
  {type: 'page', title: 'Renderer'},
  {type: 'section', title: 'Extensions'},
  // {type: 'page', title: '3D'},
  {type: 'page', title: 'Shape'},
  {type: 'page', title: 'State'}
  // {type: 'page', title: 'GPGPU'}
]

const items = {
  docs    : sidebarContents,
  examples: examples.map(name => ({
    type: 'page', title: name
  })) satisfies Content[]
}

export function SidebarContent() {
  const [, setLocation] = useLocation()
  const [, params] = useRoute('/:name')
  const currentPage = params?.name

  const currentTab: PageType = items.examples.find(({title}) => title === currentPage) ? 'examples' : 'docs'
  const handleChangeTab = (value: PageType) => {
    if(value === currentTab) return
    setLocation(`/${items[value].find(({type}) => type === 'page')?.title}`)
  }
  return (
    <Stack>
      <Tabs
        sx={({palette}) => ({px: 1, py: 0, borderBottom: `1px solid ${palette.divider}`})}
        tabSx={{flexGrow: 1, padding: 0, width: 0}}
        value={currentTab}
        options={pageTypes}
        onChange={handleChangeTab}/>
      <SidebarList items={items[currentTab]} currentPage={currentPage ?? ''}/>
    </Stack>
  )
}

function SidebarList({items, currentPage}: {items: Content[], currentPage: string}) {
  const setSidebarOpen = useSetAtom(sidebarOpenAtom)
  const isXs = useIsXs()
  const handleClick = () => setSidebarOpen(false)
  return (
    <List >
      {items.map(({title, type}) => {
        const isCurrentPage = currentPage === title
        const isPage = type === 'page'
        return (
          isPage ?
            <ListItem
              key={title}
              component={Link}
              to={title}
              sx={({palette : {text, primary}}) => ({
                color      : isCurrentPage ? primary.main : text.secondary,
                borderRight: isCurrentPage ? `2px solid ${primary.main}` : undefined,
                px         : 2
              })}
              dense
              disablePadding
              onClick={isXs ? handleClick : undefined}
            >
              <ListItemButton>
                <ListItemText sx={{textTransform: 'capitalize'}}>
                  {title}
                </ListItemText>
              </ListItemButton>
            </ListItem>
            :
            <ListItem
              key={title}
              sx={({palette : {text}}) => ({color: text.primary, pl: 2})}
              dense
              disablePadding
            >
              <ListItemText sx={{textTransform: 'capitalize'}} primaryTypographyProps={{variant: 'h6'}}>
                {title}
              </ListItemText>
            </ListItem>
        )
      })}
    </List>
  )
}
