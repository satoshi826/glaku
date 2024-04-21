import {List, ListItem, ListItemButton, ListItemText, Stack, Tab, styled} from '@mui/material'
import {useState} from 'react'
import {Tabs} from './Tabs'
import {Link} from 'wouter'

type TabOption = 'docs' | 'examples'
const tabOption: TabOption[] = ['docs', 'examples']

export function SidebarContent() {
  const [value, setValue] = useState<TabOption>('docs')
  const items = ['hoge', 'fuga']
  return (
    <Stack>
      <Tabs value={value} options={tabOption} onChange={(v) => setValue(v)}/>
      <SidebarList items={items}/>
    </Stack>
  )
}

function SidebarList({items}: {items: string[]}) {
  return (
    <List >
      {items.map(item =>
        <ListItem
          key={item}
          component={Link}
          to={`/${item}`}
          sx={({palette}) => ({color: palette.text.primary})}
          dense
          disablePadding >
          <ListItemButton>
            <ListItemText>{item}</ListItemText>
          </ListItemButton>
        </ListItem>
      )}
    </List>
  )
}
