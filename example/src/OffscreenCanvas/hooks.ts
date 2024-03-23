import React, {useEffect} from 'react'
import {OffscreenCanvasContext} from './context'

export const useOffscreenCanvas = () => {
  const {canvas, post, ref} = React.useContext(OffscreenCanvasContext)
  return {canvas, post, ref}
}

export const useCanvasListener = (fn) => {
  const {addListener, removeListener} = React.useContext(OffscreenCanvasContext)
  useEffect(() => {
    addListener(fn)
    return () => removeListener(fn)
  }, [])
}