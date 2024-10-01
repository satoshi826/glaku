import {examples} from './examples/worker'
import {sidebarContents} from './frame/Sidebar/SidebarContent'

export type PageType = 'docs' | 'examples'

export type Page = {
  type: PageType,
  name: string,
}

export const pageTypes: PageType[] = ['docs', 'examples']

export const pages = () => [
  ...sidebarContents.flatMap(({type, title}) => type === 'page'
    ? {type: 'docs', name: title}
    : []
  ),
  ...examples.map(name => ({
    type: 'examples',
    name
  }) as const)
]