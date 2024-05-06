import {atom, useAtom} from 'jotai'
import {Template} from '../Template'

const bitmapAtom = atom<ImageBitmap | null>(null)

export default function Page({name}: {name: string}) {
  const [bitmap, setBitmap] = useAtom(bitmapAtom)
  if (!bitmap) {
    throw new Promise<void>((resolve) => {
      const image = new Image()
      image.src = './hugaku.webp'
      image.onload = () => {
        createImageBitmap(image).then((b) => {
          setBitmap(b)
          resolve()
        })
      }
    })
  }
  return <Template src={name} state={{image: bitmap}}/>
}