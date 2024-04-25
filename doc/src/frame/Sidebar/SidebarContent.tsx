import {List, ListItem, ListItemButton, ListItemText, Stack} from '@mui/material'
import {Tabs} from './Tabs'
import {Link, useLocation, useRoute} from 'wouter'
import {Page, PageType, pageTypes, pages} from '../../pages'
import {aToO} from 'jittoku'

const items = aToO(pageTypes, (v) => [v, pages.filter(({type}) => type === v)])

export function SidebarContent() {
  const [, setLocation] = useLocation()
  const [, params] = useRoute('/:name')
  const currentPage = params?.name

  const currentTab: PageType = items.examples.find(({name}) => name === currentPage) ? 'examples' : 'docs'
  const handleChangeTab = (value: PageType) => {
    if(value === currentTab) return
    setLocation(`/${items[value][0].name}`)
  }

  return (
    <Stack>
      <Tabs value={currentTab} options={pageTypes} onChange={handleChangeTab}/>
      <SidebarList items={items[currentTab]} currentPage={currentPage ?? ''}/>
    </Stack>
  )
}

function SidebarList({items, currentPage}: {items: Page[], currentPage: string}) {
  return (
    <List >
      {items.map(({name}) => {
        const isCurrentPage = currentPage === name
        return (
          <ListItem
            key={name}
            component={Link}
            to={name}
            sx={({palette : {text, primary}}) => ({
              color      : isCurrentPage ? primary.main : text.primary,
              borderRight: isCurrentPage ? `2px solid ${primary.main}` : undefined
            })}
            dense
            disablePadding
          >
            <ListItemButton>
              <ListItemText >
                {name}
              </ListItemText>
            </ListItemButton>
          </ListItem>
        )
      })}
    </List>
  )
}
