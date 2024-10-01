import {Fab, Icon} from '@mui/material'
import {useCanvas, useCanvasPointer, useCanvasResize} from '../useCanvas'
import React, {ElementType, forwardRef, memo, MutableRefObject, useEffect} from 'react'
import Worker from './worker?worker'

const CanvasPointer = forwardRef(function _CanvasPointer({post} : {post : () => void}, ref) {
  useCanvasPointer({post, ref: ref as MutableRefObject<HTMLDivElement>})
  return null
})

export const Template = memo(({src, state, wrapper, sendMouse = true}: {
  src: string, state?: object, wrapper?: ElementType, sendMouse?: boolean
}) => {
  const {canvas, post, ref} = useCanvas({Worker})

  useEffect(() => {
    post({src})
    if (state) post({state})
  }, [])

  useCanvasResize({post, ref})

  const Wrapper = wrapper ?? React.Fragment
  const wrapperProps = wrapper ? {post} : {}
  return (
    <Wrapper {...wrapperProps}>
      {sendMouse && <CanvasPointer ref={ref} post={post}/>}
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