
export type PageType = 'docs' | 'examples'

export type Page = {
  type: PageType,
  name: string
}

export const pageTypes: PageType[] = ['docs', 'examples']

export const pages: Page[] = [
  {
    type: 'docs',
    name: 'hogeD'
  },
  {
    type: 'docs',
    name: 'fugaD'
  },
  {
    type: 'examples',
    name: 'helloTriangle'
  }
]