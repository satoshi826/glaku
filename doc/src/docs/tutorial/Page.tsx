import {useEffect, useRef, useState} from 'react'
import {BodyText, CaptionText, SandboxButton, SubTitleText, SyntaxTsx, TitleText} from '../components'
import {Template} from '../Template'
import Worker from '../worker?worker'
import {useCanvas} from '../../useCanvas'
import {ResizeArgs, resizeObserver} from 'glaku'
import {Box} from '@mui/material'


function CanvasWrapper({children, sandbox}: React.PropsWithChildren<{sandbox : string}>) {
  return (
    <Box width='100%' height='400px' borderRadius='32px' display='flex' position='relative' sx={{backgroundColor: '#000'}}>
      {children}
      <SandboxButton >
        {sandbox}
      </SandboxButton>
    </Box>
  )
}

export default function Page() {

  const style = 'border-radius: 24px;'
  const {canvas: canvas1, ref: ref1, post: post1} = useCanvas({Worker, style, id: '1'})
  const {canvas: canvas2, ref: ref2, post: post2} = useCanvas({Worker, style, id: '2'})
  const {canvas: canvas3, ref: ref3, post: post3} = useCanvas({Worker, style, id: '3'})
  const {canvas: canvas4, ref: ref4, post: post4} = useCanvas({Worker, style, id: '4'})

  useEffect(() => {
    if (ref1.current && ref2.current && ref3.current && ref4.current) {
      const init = (canvas : HTMLDivElement, post : (obj : object) => void, src: string) => {
        post({src})
        const ro = resizeObserver((resize) => post({resize}))
        ro.observe(canvas)
      }
      init(ref1.current, post1, '1')
      init(ref2.current, post2, '2')
      init(ref3.current, post3, '3')
      init(ref4.current, post4, '1')
    }
  }, [])

  return (
    <Template>
      <TitleText>Tutorial</TitleText>
      <SubTitleText >Goal</SubTitleText>
      <CanvasWrapper sandbox='https://codesandbox.io/p/sandbox/tutorial-many-orb-43gt6p'>
        {canvas1}
      </CanvasWrapper>
      <BodyText sx={{pt: 2}}>
        このチュートリアルでは回転する複数のオーブを作ります。IntroductionのQuick Startが完了していることを前提にしています。
      </BodyText>

      <SubTitleText >オーブを表示する</SubTitleText>
      <CanvasWrapper sandbox='https://codesandbox.io/p/sandbox/tutorial-render-orb-s7c8ps'>
        {canvas2}
      </CanvasWrapper>
      <CaptionText>リサイズ対応：解像度</CaptionText>
      <BodyText >
      Coreのインスタンスを作成する際に、resizeListenerを設定しておきましょう。
      resizeListenerは、リサイズ時のcallback関数を登録するための関数です。
      これにより、表示領域の変化にRendererの解像度が自動的に追従するようになります。
      ここではResizeObserverをシンプルに使うためのヘルパー関数(resizeObserver)を使用しています。
      </BodyText>
      <SyntaxTsx>
        {tutorialRenderOrb_core}
      </SyntaxTsx>
      <CaptionText>四角形の準備</CaptionText>
      <BodyText >
      次に、四角形をレンダするためのVaoを作成しましょう。ここでは、四角形のattributesとIndex bufferを定義しています。
      Index bufferは頂点をシンプルに定義するためのものです。詳しい解説は割愛しますが、
      四角形の表示ならば本来2つの三角形、つまりは6つの頂点が必要になるところを、共通する頂点の番号を指定することで
      4つの頂点で表現することができます。
      </BodyText>
      <SyntaxTsx>
        {tutorialRenderOrb_vao}
      </SyntaxTsx>
      <CaptionText>オーブの表示</CaptionText>
      <BodyText >
      Programクラスを使ってシェーダプログラムを作成します。
      このプログラムは、頂点シェーダとフラグメントシェーダを含み、頂点属性とユニフォーム変数を設定します。
      頂点シェーダでは、頂点の位置を変換し、フラグメントシェーダではオーブの光の加算合成を行います。
      </BodyText>
      <SyntaxTsx>
        {tutorialRenderOrb_program}
      </SyntaxTsx>
      <CaptionText>リサイズ対応：アスペクト比</CaptionText>
      <BodyText >
        [[empty4]]
      </BodyText>
      <SyntaxTsx>
        {tutorialRenderOrb_render}
      </SyntaxTsx>

      <SubTitleText sx={{pb: 1}}>オーブを回す</SubTitleText>
      <CanvasWrapper sandbox='https://codesandbox.io/p/sandbox/tutorial-rotate-orb-c7vp38'>
        {canvas3}
      </CanvasWrapper>
      <CaptionText>時間経過による回転</CaptionText>
      <BodyText >
        [[empty5]]
      </BodyText>
      <SyntaxTsx>
        {tutorialRotateOrb_program}
      </SyntaxTsx>
      <CaptionText>アニメーションループ</CaptionText>
      <BodyText >
        [[empty6]]
      </BodyText>
      <SyntaxTsx>
        {tutorialRotateOrb_render}
      </SyntaxTsx>

      <SubTitleText sx={{pb: 1}}>オーブを増やす</SubTitleText>
      <CanvasWrapper sandbox='https://codesandbox.io/p/sandbox/tutorial-many-orb-43gt6p'>
        {canvas4}
      </CanvasWrapper>
      <CaptionText>光の加算合成</CaptionText>
      <BodyText >
        [[empty7]]
      </BodyText>
      <SyntaxTsx>
        {tutorialManyOrb_core}
      </SyntaxTsx>
      <CaptionText>オーブのサイズ変更</CaptionText>
      <BodyText >
        [[empty8]]
      </BodyText>
      <SyntaxTsx >
        {tutorialManyOrb_program}
      </SyntaxTsx>
      <CaptionText>オーブの複数表示</CaptionText>
      <BodyText >
        [[empty9]]
      </BodyText>
      <SyntaxTsx >
        {tutorialManyOrb_render}
      </SyntaxTsx>

    </Template>
  )
}

const tutorialRenderOrb_core =
`const core = new Core({
  canvas,
  resizeListener: (resizeHandler) => {
    // resizeObserver(({ width, height }) => resizeHandler({ width, height })
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
  const aspectRatioVec = aspectRatio > 1 ? [aspectRatio, 1] : [1, 1 / aspectRatio];
  program.setUniform({ u_aspectRatio: aspectRatioVec });
  renderer.clear();
  renderer.render(vao, program);
});
setAspectRatio.observe(canvas);`

const tutorialRotateOrb_program =
`const program = new Program(core, {
  id: "orb",
  attributeTypes: { a_position: "vec2" },
  uniformTypes: {
    u_aspectRatio: "vec2",
    u_elapsed: "float",
  },
  vert: /* glsl */\`
      out vec2 local_pos;
      void main() {
        vec2 pos = a_position / u_aspectRatio;
        float angel = 0.0005 * u_elapsed;
        vec2 rotate = vec2(sin(angel), cos(angel)) / u_aspectRatio;
        gl_Position = vec4(pos + rotate, 1.0, 1.0);
        local_pos = a_position;
      }\`,
  frag: /* glsl */ \`
      in vec2 local_pos;
      out vec4 o_color;
      void main() {
        float radius = length(local_pos);
        float brightness = 1.0 / radius;
        o_color = vec4(vec3(smoothstep(1.0, 10.0, brightness)), 1.0);
      }\`,
});`

const tutorialRotateOrb_render =
`const renderer = new Renderer(core);

const setAspectRatio = resizeObserver(({ width, height }) => {
  const aspectRatio = width / height;
  const aspectRatioVec =
    aspectRatio > 1 ? [aspectRatio, 1] : [1, 1 / aspectRatio];
  program.setUniform({ u_aspectRatio: aspectRatioVec });
});
setAspectRatio.observe(canvas);

const animation = new Loop({
  callback: ({ elapsed }) => {
    program.setUniform({ u_elapsed: elapsed });
    renderer.clear();
    renderer.render(vao, program);
  },
});
animation.start();`

const tutorialManyOrb_core =
`const core = new Core({
  canvas,
  resizeListener: (resizeHandler) => {
    const observer = resizeObserver(resizeHandler);
    observer.observe(canvas);
  },
  options: ["BLEND"],
});
core.gl.blendFunc(core.gl.ONE, core.gl.ONE);
`

const tutorialManyOrb_program =
`const program = new Program(core, {
  id            : 'orb',
  attributeTypes: {a_position: 'vec2'},
  uniformTypes  : {
    u_aspectRatio: 'vec2',
    u_elapsed    : 'float',
    u_orbSize    : 'float'
  },
  vert: /* glsl */ \`
      out vec2 local_pos;
      void main() {
        vec2 pos = a_position * u_orbSize / u_aspectRatio;
        float angel = 0.0005 * u_elapsed / u_orbSize;
        vec2 rotate = 1.5 * u_orbSize * vec2(sin(angel), cos(angel)) / u_aspectRatio;
        gl_Position = vec4(pos + rotate, 1.0, 1.0);
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

const tutorialManyOrb_render =
`const renderer = new Renderer(core)

resizeState.on(({width, height}) => {
  const aspectRatio = width / height
  const aspectRatioVec = aspectRatio > 1 ? [aspectRatio, 1] : [1, 1 / aspectRatio]
  program.setUniform({u_aspectRatio: aspectRatioVec})
})

const orbSizes = [...Array(50)].map((_, i) => (i + 2) * 0.015)

const animation = new Loop({callback: ({elapsed}) => {
  renderer.clear()
  program.setUniform({u_elapsed: elapsed})
  orbSizes.forEach((size) => {
    program.setUniform({u_orbSize: size})
    renderer.render(vao, program)
  })
}})
animation.start()`
