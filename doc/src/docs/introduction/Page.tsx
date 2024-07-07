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
        動作確認のためにも、理解のためにも、まず手元で動かすのが良さそうですよね。以下のサンプルとなるコードを試してみましょう、青い三角形が表示されたら成功です！
        補足としてReactで使用する場合のコードを付与しましたが、核となる処理は同一であることが分かると思います。
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
        このチュートリアルでは上記のQuick Startの内容についてまず解説し、
        その後実践的な機能(Animation/Resize/Texture/PostEffectなど)を付与していきながらGlakuの使い方に触れていきます。
        レンダリングまでの流れはとてもシンプルで"VAO"と"Program"を用意して"Renderer"に渡すだけです。
        発展的な実装を行う場合も基本はこの流れを逸脱することはありません。
      </BodyText>
      <CaptionText>Core</CaptionText>
      <BodyText >
        まずCoreを準備しましょう。
        CoreのコンストラクタにCanvas(HTMLCanvasElement または OffScreenCanvas)を渡すことで最小限の初期化が完了します。
        CoreはwebGLでレンダリングするための様々な状態を管理します。ただしCoreのメソッドやフィールドは他クラスから参照されることがほとんとで、
        直接を操作することは少ないかもしれません。
      </BodyText>
      <Syntax lang='tsx'>
        {tutorialCore}
      </Syntax>
      <CaptionText>VAO</CaptionText>
      <BodyText >
        VAOとはVertexArrayObjectの略称で、各頂点で扱うattributeを格納するものです。ここではattributesとして、
        3つの2次元位置座標を定義しています。試しに <code>a_position</code> の値を変更して三角形の形が変わる様子を見てみましょう。
        attributeにセットした値をどのように使用するかはプログラマーの裁量になります。(つまりシェーダ次第です。)今回は2次元座標としてattributesを
        使用していますが、3次元の座標や、頂点の色としてRGBをセットするのも自由です。
        (一般的な3Dレンダリングでは、位置座標、UV座標、法線ベクトルなどを格納することが多いです。)
      </BodyText>
      <Syntax lang='tsx'>
        {tutorialVAO}
      </Syntax>
      <CaptionText>Program</CaptionText>
      <BodyText >
        いよいよ本命のProgramです。Programには2つのGLSLシェーダ(vertex shader / fragment shader)と、シェーダ内で扱う変数(ここではa_position)を定義します。
        {/* (GLSLについて厳密な解説を始めるとキリがないので概要) */}
      </BodyText>
      <Syntax lang='tsx'>
        const renderResult = Vao.map(attributes)
      </Syntax>
      <Syntax lang='tsx'>
        {tutorialProgram}
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

const tutorialRenderer =
'const renderer = new Renderer(core);'