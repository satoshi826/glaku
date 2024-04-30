
export type PageType = 'docs' | 'examples'

export type Page = {
  type: PageType,
  name: string
}

export const pageTypes: PageType[] = ['docs', 'examples']

export const pages: Page[] = [
  {
    type: 'docs',
    name: 'getStarted'
  },
  {
    type: 'docs',
    name: 'hogeD'
  },
  {
    type: 'examples',
    name: 'helloTriangle'
  },
  {
    type: 'examples',
    name: 'attributes'
  },
  {
    type: 'examples',
    name: 'demo'
  }
]