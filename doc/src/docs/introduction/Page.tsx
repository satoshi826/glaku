import {useState} from 'react'
import {BodyText, CaptionText, SubTitleText, Syntax, TitleText} from '../components'
import {Tabs} from '../../components/Tabs'
import {Template} from '../Template'

export default function Page() {
  const [state, setState] = useState<'Vanilla' | 'React'>('Vanilla')
  const code = state === 'Vanilla' ? quickStartVanilla : quickStartReact
  const sandbox = state === 'Vanilla'
    ? 'https://codesandbox.io/p/sandbox/hello-glaku-skgjgf'
    : 'https://codesandbox.io/p/sandbox/hello-glaku-react-qf9gj4'
  return (
    <Template>
      <TitleText >Introduction</TitleText>
      <SubTitleText >Overview</SubTitleText>
      <BodyText >
          Glaku はシンプルかつミニマムなwebGLライブラリで、ピュアなwebGLが持つパワーを引き出すことを目的にしています。
          GlakuはWebGL2を前提としたAPIを搭載しており、InstancingやMRTなどを手軽に扱えることができます。
          Enjoy WebGL !
      </BodyText>
      <SubTitleText>Installation</SubTitleText>
      <Syntax lang={undefined}>
          npm i glaku
      </Syntax>
      <SubTitleText>Quick Start</SubTitleText>
      <BodyText >
        まずは手元で動かしてみるのが良さそうですよね。以下のサンプルコードを試してみましょう、青い三角形が表示されたら成功です！
        レンダリングまでの流れはとてもシンプルで、"VAO"と"Program"を用意して"Renderer"に渡しているだけです。
        発展的な実装を行う場合もこの流れから逸脱することはありません。
      </BodyText>
      <Tabs
        value={state}
        options={['Vanilla', 'React']}
        onChange={setState}
        tabSx={{textTransform: 'unset'}}
      />
      <Syntax lang='tsx' sandbox={sandbox}>
        {code}
      </Syntax>
      <SubTitleText >Tutorial</SubTitleText>
      <BodyText >
        このチュートリアルでは、まず上記のQuick Startの内容について解説し、
        その後実践的な機能を付与していきながらGlakuの機能に触れていきます。
      </BodyText>
      <CaptionText>Core</CaptionText>
      <BodyText >
        まずCoreを準備しましょう。
        CoreのコンストラクタにCanvas(HTMLCanvasElement または OffScreenCanvas)を渡すことで最小限の初期化が完了します。
        CoreはwebGLでレンダリングするための様々な状態を管理していますが、他クラスから参照して使われることがほとんとなので、
        直接操作することは少ないかもしれません。
      </BodyText>
      <Syntax lang='tsx'>
        {tutorialCore}
      </Syntax>
      <CaptionText>VAO</CaptionText>
      <BodyText >
        VAOはVertexArrayObjectの略称で、各頂点で扱うattributesを格納するものです。ここではattributesとして、
        3つの2次元位置座標を定義しています。試しに <code>a_position</code> の値を変更して三角形の形が変わる様子を見てみましょう。
        attributeがどのように使われるかはシェーダ次第です。(3次元座標やRGBをセットするのも自由です)
      </BodyText>
      <Syntax lang='tsx'>
        {tutorialVAO}
      </Syntax>
      <CaptionText>Program</CaptionText>
      <BodyText >
        本命のProgramです。Programには2対のGLSLシェーダ(vertex shader / fragment shader)と、
        シェーダ内で扱う変数の名前と型(ここではa_position: "vec2")を定義します。
      </BodyText>
      <Syntax lang='tsx'>
        {tutorialProgram}
      </Syntax>
      <BodyText sx={{pt: 2}}>
        シェーダの働きについて丁寧な解説を行うには余白が狭すぎるので、Javascript風の疑似コードで大雑把に解説します。
        まずattributesは頂点単位に分割されます。今回扱う <code>a_position</code> の要素数は6でしたが、2個の要素が1つの頂点に対応しているので頂点数は3ですね。(三角形として定義したので自明ですが)
        <br></br>
        次に、頂点の数だけvertexShaderを実行して、レンダリング対象の座標を決定します。
        今回のシェーダではa_positionの位置をそのまま使いますが、
      </BodyText>
      <Syntax lang='tsx'>
        {tutorialGLSL}
      </Syntax>
    </Template>
  )
}

const quickStartVanilla =
`import { Core, Vao, Program, Renderer } from "glaku";

const canvas = document.getElementById("c");
const core = new Core({ canvas });
const vao = new Vao(core, {
  id: "triangle",
  attributes: { a_position: [0, 1, 1, -1, -1, -1] },
});
const program = new Program(core, {
  id: "hello",
  attributeTypes: { a_position: "vec2" },
  vert: /* glsl */ \`
      void main() {
        gl_Position = vec4(a_position, 1.0, 1.0);
      }\`,
  frag: /* glsl */ \`
      out vec4 o_color;
      void main() {
        o_color = vec4(0.4, 0.4, 1.0, 1.0);
      }\`,
});
const renderer = new Renderer(core);
renderer.render(vao, program);
`

const quickStartReact =
`import { useEffect, useRef } from "react";
import { Core, Vao, Program, Renderer } from "glaku";

export default function App() {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const core = new Core({ canvas });
      const vao = new Vao(core, {
        id: "triangle",
        attributes: { a_position: [0, 1, 1, -1, -1, -1] },
      });
      const program = new Program(core, {
        id: "hello",
        attributeTypes: { a_position: "vec2" },
        vert: /* glsl */ \`
            void main() {
              gl_Position = vec4(a_position, 1.0, 1.0);
            }\`,
        frag: /* glsl */ \`
            out vec4 o_color;
            void main() {
              o_color = vec4(0.4, 0.4, 1.0, 1.0);
            }\`,
      });
      const renderer = new Renderer(core);
      renderer.render(vao, program);
    }
  }, []);
  return <canvas ref={canvasRef} />;
}
`

const tutorialCore =
`const canvas = document.getElementById("c");
const core = new Core({ canvas });
`

const tutorialVAO =
`const vao = new Vao(core, {
  id: "triangle",
  attributes: { a_position: [0, 1, 1, -1, -1, -1] },
});
`

const tutorialProgram =
`const program = new Program(core, {
  id: "hello",
  attributeTypes: { a_position: "vec2" },
  vert: /* glsl */ \`
      void main() {
        gl_Position = vec4(a_position, 1.0, 1.0);
      }\`,
  frag: /* glsl */ \`
      out vec4 o_color;
      void main() {
        o_color = vec4(0.4, 0.4, 1.0, 1.0);
      }\`,
});
`

const tutorialGLSL =
`const vertexes = chunk(vao)

const positions = vertexes.map(attributes => {
  const position = vertexShader(attributes)
  return position
})

const surfaces = rasterize(positions)

const renderResult = surfaces.map(pixelPosition => {
  const color = fragmentShader(pixelPosition)
  return color
})
`

const tutorialRenderer =
'const renderer = new Renderer(core);'