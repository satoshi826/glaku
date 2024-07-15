import {Fab, Icon} from '@mui/material'
import {useCanvas} from './useCanvas'
import React, {ElementType, memo, useEffect} from 'react'
import {resizeObserver, screenToViewPort} from 'glaku'
import {HEADER_HEIGHT} from '../frame/Header/Header'

export const Template = memo(({src, state, wrapper, sendMouse = true}: {
  src: string, state?: object, wrapper?: ElementType, sendMouse?: boolean
}) => {
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

  const handleTouchMove = ({changedTouches, touches} : TouchEvent) => {
    if (touches.length === 1) {
      const touch = changedTouches[0]
      const {clientX, clientY, target} = touch
      const {clientWidth, clientHeight} = target as HTMLElement
      const {x, y} = screenToViewPort({offsetX: clientX, offsetY: clientY - HEADER_HEIGHT, clientWidth, clientHeight})
      post({state: {mouse: {x, y}}})
    }
  }

  useEffect(() => {
    if (ref.current) {
      sendResize.observe(ref.current)
      if (sendMouse) {
        ref.current.addEventListener('mousemove', handleMouseMove)
        ref.current.addEventListener('touchmove', handleTouchMove)
      }
    }
    return () => {
      if (ref.current) {
        sendResize.unobserve(ref.current)
        if (sendMouse) {
          ref.current.removeEventListener('mousemove', handleMouseMove)
          ref.current.removeEventListener('touchmove', handleTouchMove)
        }
      }
    }
  }, [ref])

  const Wrapper = wrapper ?? React.Fragment
  const wrapperProps = wrapper ? {post} : {}

  return (
    <Wrapper {...wrapperProps}>
      {canvas}
      <Fab sx={{position: 'absolute', right: 16, bottom: 16}}
        LinkComponent={'a'}
        href={`https://github.com/satoshi826/glaku/blob/main/doc/src/examples/${src}/main.ts`}
        target="_blank"
      >
        <Icon >code</Icon>
      </Fab>
    </Wrapper>
  )
})