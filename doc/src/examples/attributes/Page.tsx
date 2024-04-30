import {useOffscreenCanvas} from '../../OffscreenCanvas/hooks'

export default function Page() {
  const {post} = useOffscreenCanvas()
  post({src: 'attributes'})
  return null
}