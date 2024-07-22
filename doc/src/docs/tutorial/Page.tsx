import {useEffect, useRef, useState} from 'react'
import {BodyText, CaptionText, SubTitleText, Syntax, TitleText} from '../components'
import {Template} from '../Template'
import Worker from '../worker?worker'
import {useCanvas} from '../../useCanvas'
import {resizeObserver} from 'glaku'

export default function Page() {

  const {canvas: canvas1, ref: ref1, post: post1} = useCanvas({Worker, style: 'border-radius: 32px;'})
  // const {canvas, ref, post} = useCanvas({Worker, style: 'border-radius: 32px;'})

  useEffect(() => {
    const ro = resizeObserver((resize) => post1({resize}))
    ro.observe(ref1.current!)
  }, [])

  return (
    <Template>
      <TitleText>Tutorial</TitleText>
      <SubTitleText sx={{pb: 1}}>Goal</SubTitleText>
      <div style={{width: '100%', height: '500px', borderRadius: '32px', display: 'flex'}}>
        {canvas1}
      </div>
      <BodyText sx={{pt: 2}}>
        このチュートリアルでは回転する複数のオーブを段階を踏んで作っていきましょう。
      </BodyText>
      <SubTitleText sx={{pb: 1}}>オーブを作る</SubTitleText>
      <SubTitleText sx={{pb: 1}}>オーブを回す</SubTitleText>
      <SubTitleText sx={{pb: 1}}>オーブを増やす</SubTitleText>
    </Template>
  )
}

const tutorialGoal =
`import {Core, Vao, Program, Renderer, Loop, resizeObserver} from 'glaku'

export const main = (canvas: HTMLCanvasElement) => {

  const core = new Core({canvas,
    resizeListener: (resizeHandler) => {
      const observer = resizeObserver(resizeHandler)
      observer.observe(canvas)
    },
    options: ['BLEND']
  })
  core.gl.blendFunc(core.gl.ONE, core.gl.ONE)

  const vao = new Vao(core, {
    id        : 'rect',
    attributes: {
      a_position: [
        -1.0, 1.0,
        1.0, 1.0,
        -1.0, -1.0,
        1.0, -1.0
      ]
    },
    index: [
      2, 1, 0,
      1, 2, 3
    ]
  })
  const program = new Program(core, {
    id            : 'orbs',
    attributeTypes: {a_position: 'vec2'},
    uniformTypes  : {
      u_elapsed    : 'float',
      u_aspectRatio: 'vec2',
      u_orbSize    : 'float'
    },
    vert: /* glsl */ \`
        out vec2 local_pos;
        void main() {
          vec2 pos = a_position * u_orbSize / u_aspectRatio ;
          float angel = 0.0005 * u_elapsed / u_orbSize;
          vec2 rotate = u_orbSize * vec2(sin(angel), cos(angel)) / u_aspectRatio;
          gl_Position = vec4(pos + rotate, 1.0, 1.0);
          local_pos = a_position;
        }\`,
    frag: /* glsl */ \`
        in vec2 local_pos;
        out vec4 o_color;
        void main() {
          float radius = length(local_pos);
          float brightness = 1.0 / radius;
          o_color = vec4(vec3(smoothstep(0.8, 25.0, brightness)), 1.0);
        }\`
  })

  const setAspectRatio = resizeObserver(({width, height}) => {
    const aspectRatio = width / height
    const aspectRatioVec = aspectRatio > 1 ? [aspectRatio, 1] : [1, 1 / aspectRatio]
    program.setUniform({u_aspectRatio: aspectRatioVec})
  })
  setAspectRatio.observe(canvas)

  const renderer = new Renderer(core)

  const orbSizes = [...Array(50)].map(() => Math.random() * 0.9 + 0.1)

  const animation = new Loop({callback: ({elapsed}) => {
    renderer.clear()
    program.setUniform({u_elapsed: elapsed})
    orbSizes.forEach((size) => {
      program.setUniform({u_orbSize: size})
      renderer.render(vao, program)
    })
  }})
  animation.start()
}`