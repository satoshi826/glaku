// import {useEffect} from 'react'
import {Template} from '../Template'
import {useCanvas} from '../useCanvas'
import {Box} from '@mui/material'
export default function Page({name}: {name: string}) {
  // const {post, ref} = useCanvas()

  const handleMouseMove = (e) => {
    // const {clientWidth, clientHeight} = target as HTMLElement
    // console.log(e)
  }

  // useEffect(() => {
  //   console.log(ref.current)
  //   if (ref.current) {
  //     ref.current.addEventListener('mousemove', handleMouseMove)
  //   }
  //   return () => {
  //     if (ref.current) ref.current.removeEventListener('mousemove', handleMouseMove)
  //   }
  // }, [ref])

  return(
    <Box display='flex' width='100%' height='100%' onMouseMove={handleMouseMove}>
      <Template src={name} sendMouse={false}/>
    </Box>
  )
}