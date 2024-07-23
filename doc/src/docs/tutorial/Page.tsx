import {useEffect, useRef, useState} from 'react'
import {BodyText, CaptionText, SubTitleText, Syntax, TitleText} from '../components'
import {Template} from '../Template'
import Worker from '../worker?worker'
import {useCanvas} from '../../useCanvas'
import {ResizeArgs, resizeObserver} from 'glaku'

export default function Page() {

  const {canvas: canvas1, ref: ref1, post: post1} = useCanvas({Worker, style: 'border-radius: 32px;', id: '1'})
  const {canvas: canvas2, ref: ref2, post: post2} = useCanvas({Worker, style: 'border-radius: 32px;', id: '2'})
  const {canvas: canvas3, ref: ref3, post: post3} = useCanvas({Worker, style: 'border-radius: 32px;', id: '3'})

  useEffect(() => {
    if (ref1.current && ref2.current && ref3.current) {
      const init = (canvas : HTMLDivElement, post : (obj : object) => void, src: string) => {
        post({src})
        const ro = resizeObserver((resize) => post({resize}))
        ro.observe(canvas)
      }
      init(ref1.current, post1, '1')
      init(ref2.current, post2, '2')
      init(ref3.current, post3, '3')
    }
  }, [])

  return (
    <Template>
      <TitleText>Tutorial</TitleText>
      <SubTitleText sx={{pb: 1}}>Goal</SubTitleText>
      <div style={{width: '100%', height: '400px', borderRadius: '32px', display: 'flex'}}>
        {canvas1}
      </div>
      <BodyText sx={{pt: 2}}>
        このチュートリアルでは回転する複数のオーブを作ります。IntroductionのQuick Startが完了していることを前提にしています。
      </BodyText>
      <SubTitleText sx={{pb: 1}}>オーブを作る</SubTitleText>
      <div style={{width: '100%', height: '400px', borderRadius: '32px', display: 'flex'}}>
        {canvas2}
      </div>
      <BodyText sx={{pt: 2}}>
        このチュートリアルでは回転する複数のオーブを作ります。IntroductionのQuick Startが完了していることを前提にしています。
      </BodyText>
      <Syntax lang='tsx'>
        {tutorialRenderOrb_core}
      </Syntax>
      <Syntax lang='tsx'>
        {tutorialRenderOrb_vao}
      </Syntax>
      <Syntax lang='tsx'>
        {tutorialRenderOrb_program}
      </Syntax>
      <Syntax lang='tsx'>
        {tutorialRenderOrb_render}
      </Syntax>
      <SubTitleText sx={{pb: 1}}>オーブを回す</SubTitleText>
      <div style={{width: '100%', height: '400px', borderRadius: '32px', display: 'flex'}}>
        {canvas3}
      </div>
      <SubTitleText sx={{pb: 1}}>オーブを増やす</SubTitleText>
    </Template>
  )
}

const tutorialRenderOrb_core =
`const core = new Core({
  canvas,
  resizeListener: (resizeHandler) => {
    const observer = resizeObserver(resizeHandler);
    observer.observe(canvas);
  }
})
`

const tutorialRenderOrb_vao =
`const vao = new Vao(core, {
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
`


const tutorialRenderOrb_program =
`const program = new Program(core, {
  id            : 'orb',
  attributeTypes: {a_position: 'vec2'},
  uniformTypes  : {
    u_aspectRatio: 'vec2'
  },
  vert: /* glsl */ \`
    out vec2 local_pos;
    void main() {
      vec2 pos = a_position / u_aspectRatio;
      gl_Position = vec4(pos, 1.0, 1.0);
      local_pos = a_position;
    }\`,
  frag: /* glsl */ \`
    in vec2 local_pos;
    out vec4 o_color;
    void main() {
      float radius = length(local_pos);
      float brightness = 1.0 / radius;
      o_color = vec4(vec3(smoothstep(1.0, 10.0, brightness)), 1.0);
    }\`
  })
`

const tutorialRenderOrb_render =
`const renderer = new Renderer(core);

const setAspectRatio = resizeObserver(({ width, height }) => {
  const aspectRatio = width / height;
  const aspectRatioVec =
    aspectRatio > 1 ? [aspectRatio, 1] : [1, 1 / aspectRatio];
  program.setUniform({ u_aspectRatio: aspectRatioVec });
  renderer.clear();
  renderer.render(vao, program);
});
setAspectRatio.observe(canvas);`