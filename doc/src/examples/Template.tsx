import {Fab, Icon} from '@mui/material'
import {useCanvas} from './useCanvas'
import {useEffect} from 'react'
import {resizeObserver, screenToViewPort} from 'gippy'

export function Template({src, state}: {src: string, state?: object}) {
  const {canvas, post, ref} = useCanvas()

  useEffect(() => {
    post({src})
    if (state) post({state})
  }, [])

  const sendResize = resizeObserver(({width, height}) => post({state: {resize: {width, height}}}))

  const handleMouseMove = ({offsetX, offsetY, target}: MouseEvent) => {
    const {clientWidth, clientHeight} = target as HTMLElement
    const {x, y} = screenToViewPort({offsetX, offsetY, clientWidth, clientHeight})
    post({state: {mouse: {x, y}}})
  }

  useEffect(() => {
    if (ref.current) {
      sendResize.observe(ref.current)
      ref.current.addEventListener('mousemove', handleMouseMove)
    }
    return () => {
      if (ref.current) {
        sendResize.unobserve(ref.current)
        ref.current.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [ref])


  return (
    <>
      {canvas}
      <Fab sx={{position: 'absolute', right: 16, bottom: 16}}>
        <Icon>code</Icon>
      </Fab>
    </>
  )
}