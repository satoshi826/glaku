import {useOffscreenCanvas} from '../../OffscreenCanvas/hooks'

export default function Page() {
  const {post} = useOffscreenCanvas()
  post({src: 'demo'})
  return null
}