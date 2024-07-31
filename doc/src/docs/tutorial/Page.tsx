import {useEffect, useRef, useState} from 'react'
import {BodyText, CaptionText, Code, SandboxButton, SubTitleText, SyntaxTsx, TitleText} from '../components'
import {Template} from '../Template'
import Worker from '../worker?worker'
import {useCanvas} from '../../useCanvas'
import {ResizeArgs, resizeObserver} from 'glaku'
import {Box, Typography} from '@mui/material'


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
        Glakuの使い方を説明しつつ、WebGLに関する解説も行っていきます。
      </BodyText>

      <SubTitleText >オーブを表示する</SubTitleText>
      <CanvasWrapper sandbox='https://codesandbox.io/p/sandbox/tutorial-render-orb-s7c8ps'>
        {canvas2}
      </CanvasWrapper>
      <CaptionText>リサイズ対応：解像度</CaptionText>
      <BodyText >
        Coreのインスタンス作成する際に、resizeListenerを設定しましょう。
        resizeListenerは、リサイズ時のcallback関数を登録するための関数です。
        これにより、キャンバスサイズの変化にRendererの解像度が追従するようになります。
        ここでは、ResizeObserverをシンプルに使うためのヘルパー関数(<Code>resizeObserver</Code>)を使用しています。
      </BodyText>
      <SyntaxTsx>
        {tutorialRenderOrb_core}
      </SyntaxTsx>
      <CaptionText>四角形の準備</CaptionText>
      <BodyText >
        次に、四角形をレンダするためのVaoを作成しましょう。ここでは、四角形のattributesとindex bufferを定義しています。
        index bufferは頂点をシンプルに定義するためのものです。
        四角形を表示する際には、本来2つの三角形（つまり6つの頂点）が必要ですが、
        共通する頂点の番号を指定することで4つの頂点で表現できます。
      </BodyText>
      <SyntaxTsx>
        {tutorialRenderOrb_vao}
      </SyntaxTsx>
      <CaptionText>Programの作成</CaptionText>
      <Typography variant='body1' sx={{pb: 1}}>Uniform</Typography>
      <BodyText >
        ここでuniformという概念が登場します。
        attributeでは「各頂点に対応するデータ」を設定できましたが、
        uniformを使用することで「どの頂点でも共通して使えるデータ」を設定することができます。
        <br/>
        例として、VertexShaderで指定する<Code>gl_Position</Code>は、
        キャンバスの端から端を<Code>[-1, 1]</Code>の範囲で指定しますが、
        何も対策しない場合はキャンバスサイズに連動してオーブが伸び縮みしてしまいます。
        そこで伸び縮みを防ぐために、<Code>a_position</Code>をキャンバスのアスペクト比で除算します。
        そのために<Code noWrap>u_aspectRatio: 'vec2'</Code>をuniformTypesに指定して、
        VertexShaderで<Code noWrap>a_position / u_aspectRatio</Code>
        とすることでオーブの形状がキャンバスのアスペクト比の影響を受けないようにしています。
      </BodyText>
      <Typography variant='body1' sx={{pb: 1}}>Varying</Typography>
      <BodyText >
        オーブの表示のために座標位置をFragmentShaderで参照したいです。
        しかし、FragmentShaderからattributeを直接参照することはできないので、
        varyingという仕組みによってVertexShaderからFragmentShaderへデータを渡します。
        方法は単純で、まずVertexShaderでvaryingとして渡す変数を宣言します。(<Code noWrap>out vec2 local_pos</Code>)
        次に宣言した変数に値を代入することで、FragmentShaderへ値を渡します。(<Code noWrap>local_pos = a_position</Code>)
        そしてFragmentShaderでは受け取る変数を宣言するだけでデータを使用できます。
        (<Code noWrap>in vec2 local_pos</Code>)
        <br/>
        また、四角形の中心など頂点以外の場所でFragmentShaderが受け取る値はどうなるのか疑問に思うかもしれませんが、
        これについてはwebGLが自動的に線形補完をかけた上でFragmentShadeに値を渡してくれます。
        つまり四角形の中心で実行されるFragmentShaderは<Code >local_pos</Code>として<Code>[0, 0]</Code>を受け取ることができます。
      </BodyText>
      <Typography variant='body1' sx={{pb: 1}}>FragmentShader</Typography>
      <BodyText >
        オーブの核心に来ました。ポイントは光の減衰です。
        ただの白い円は光っているようには見えませんが、中心から離れるほど白から黒へ滑らかに変化させると、
        それは光のように見えます。これをコードで表してみましょう。

        まず、<Code >local_pos</Code>は中心位置を<Code>[0, 0]</Code>とする四角形の座標位置でした。
        なので、<Code>local_pos</Code>を位置ベクトルとして扱い、
        この長さを求めることで中心からの距離が分かります。(<Code noWrap>radius = length(local_pos)</Code>)
        <br/>
        そして中心からの距離の逆数は、中心で無限大になり、遠方になるにつれて0に漸近していきます。この値をオーブの明るさとして
        扱うことにしましょう。(<Code noWrap>brightness = 1.0 / radius</Code>)
        あとはこれを表示すれば良いのですが、そのままでは明るすぎて四角形の角が見えてしまうので、程よい感じになるように値を補正します。
        (<Code noWrap>smoothstep(1.0, 10.0, brightness)</Code>)




      </BodyText>
      <SyntaxTsx>
        {tutorialRenderOrb_program}
      </SyntaxTsx>
      <CaptionText>リサイズ対応：アスペクト比</CaptionText>
      <BodyText >
        Programに<Code >u_aspectRatio</Code>を渡せるようにしたので、
        キャンバスがリサイズされたタイミングで<Code noWrap>setUniform</Code>メソッドを使ってデータをセットしましょう。
        ここで<Code >aspectRatioVec</Code>は、キャンバスの短辺に対する長辺の割合を表しており、
        例えば <Code noWrap>width: 200 height: 100</Code> なら <Code noWrap>aspectRatioVec = [2, 1]</Code>となり、
        <Code noWrap>width: 400 height: 800</Code> なら  <Code noWrap>aspectRatioVec = [1, 2]</Code>となります。
        <br/>
        また、uniformをセットするだけでは表示されないので、このタイミングでレンダリングも行いましょう。
      </BodyText>
      <SyntaxTsx>
        {tutorialRenderOrb_render}
      </SyntaxTsx>

      <SubTitleText sx={{pb: 1}}>オーブを回す</SubTitleText>
      <CanvasWrapper sandbox='https://codesandbox.io/p/sandbox/tutorial-rotate-orb-c7vp38'>
        {canvas3}
      </CanvasWrapper>
      <CaptionText>経過時間に応じた回転</CaptionText>
      <BodyText >
        VertexShaderを使ってオーブを回しましょう。
        まずuniformTypesに<Code noWrap>u_elapsed: "float"</Code>を追加して、経過時間を扱えるようにします。
        続いて経過時間に応じて増大する角度を<Code noWrap>angel = 0.0005 * u_elapsed</Code>として表します。
        あとは<Code noWrap>vec2(cos(angel), sin(angel))</Code>とすることで回転による移動を計算することができますが、
        このままでは<Code >a_position</Code>の同様にアスペクト比の影響を受けてしまうので
        <Code noWrap>u_aspectRatio</Code>を使って補正しましょう。
        (<Code noWrap>vec2 rotate = vec2(cos(angel), sin(angel)) / u_aspectRatio</Code>)
        <br/>
        最後に、元々の座標に回転による移動を足すことで回転するオーブを表現できます。(<Code >pos + rotate</Code>)
      </BodyText>
      <SyntaxTsx>
        {tutorialRotateOrb_program}
      </SyntaxTsx>
      <CaptionText>アニメーションループ</CaptionText>
      <BodyText >
        
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
  uniformTypes  : {u_aspectRatio: 'vec2'},
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
        vec2 rotate = vec2(cos(angel), sin(angel)) / u_aspectRatio;
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
        vec2 rotate = 1.5 * u_orbSize * vec2(cos(angel), sin(angel)) / u_aspectRatio;
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
`const renderer = new Renderer(core);

const setAspectRatio = resizeObserver(({ width, height }) => {
  const aspectRatio = width / height;
  const aspectRatioVec =
    aspectRatio > 1 ? [aspectRatio, 1] : [1, 1 / aspectRatio];
  program.setUniform({ u_aspectRatio: aspectRatioVec });
});
setAspectRatio.observe(canvas);

const orbSizes = [...Array(50)].map((_, i) => (i + 2) * 0.015);

const animation = new Loop({
  callback: ({ elapsed }) => {
    renderer.clear();
    program.setUniform({ u_elapsed: elapsed });
    orbSizes.forEach((size) => {
      program.setUniform({ u_orbSize: size });
      renderer.render(vao, program);
    });
  },
});
animation.start();`
