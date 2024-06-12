import {useEffect} from 'react'
import {Template} from '../Template'
import {useCanvas} from '../useCanvas'
export default function Page({name}: {name: string}) {
  const {post} = useCanvas()

  useEffect(() => {
    post({state: 'hoge'})
  }, [])

  return <Template src={name} sendMouse={false}/>
}