import {useEffect, useRef} from 'react'
import {Box, Button, Typography} from '@mui/material'
import {useCanvas, useCanvasPointer, useCanvasResize} from './useCanvas'
import Worker from './rootWorker?worker'
import {Link} from 'wouter'

export function Root() {
  const {canvas, ref, post} = useCanvas({Worker, id: 'root'})
  useCanvasResize({post, ref})
  useCanvasPointer({post, ref})
  const fontRef = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    fetch('https://fonts.googleapis.com/css2?family=Comfortaa&display=swap&text=Glaku').then(async(res) => {
      const cssFontFace = await res.text()
      const urls = cssFontFace.match(/url\(.+?\)/g)!
      for (const url of urls) {
        const font = new FontFace('Comfortaa', url)
        await font.load()
        document.fonts.add(font)
      }
      if (fontRef.current) {
        const ctx = fontRef.current.getContext('2d')!
        ctx.font = 'bold 512px Comfortaa'
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText('Glaku', 50, 450)
        const canvasEl = document.getElementById('font_canvas') as HTMLCanvasElement
        canvasEl.toBlob(async(blob) => {
          const bitmap = await createImageBitmap(blob!)
          post({image: bitmap})
        })
      }
    })

  }, [])

  return (
    <Box width='100%' flexGrow={1} >
      <Box width='100%' height='100%' display='flex' flexDirection="column-reverse" position='relative' sx={{backgroundColor: '#0000'}}>
        {canvas}
        <Box position='absolute' visibility="hidden" width='100%' height='60%' display='flex' justifyContent='center' gap={3} flexDirection="column" sx={{placeItems: 'center'}}>
          <Typography
            sx={{
              padding     : 1,
              borderRadius: '16px'
            }}
            fontFamily='Comfortaa' fontSize={28} visibility="visible">
            Simple WebGL Library
          </Typography>
          <Box display='flex' gap={3} justifyContent='center' >
            <Button variant='contained' LinkComponent={Link} href='/introduction' sx={{textTransform: 'unset', visibility: 'visible'}}>
              Getting Started
            </Button>
            <Button
              variant='outlined' LinkComponent='a' href='https://github.com/satoshi826/glaku' target='_blank'
              sx={{
                textTransform  : 'unset',
                visibility     : 'visible',
                backgroundColor: '#121212aa',
                backdropFilter : 'blur(8px)'
              }}>
              View on Github
            </Button>
          </Box>
        </Box>
      </Box>
      <canvas id="font_canvas" width={1600} height={800} ref={fontRef} style={{display: 'none'}}/>
    </Box>
  )
}