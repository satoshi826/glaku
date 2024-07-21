import {useState} from 'react'
import {BodyText, CaptionText, SubTitleText, Syntax, TitleText} from '../components'
import {Tabs} from '../../components/Tabs'
import {Template} from '../Template'

export default function Page() {
  const [state, setState] = useState<'Main' | 'Vanilla' | 'React'>('Main')
  const code = {
    Main   : quickStartMain,
    Vanilla: quickStartVanilla,
    React  : quickStartReact
  }[state]
  const sandbox = state !== 'Main' ? {
    Vanilla: 'https://codesandbox.io/p/sandbox/hello-glaku-skgjgf',
    React  : 'https://codesandbox.io/p/sandbox/hello-glaku-react-qf9gj4'
  }[state] : undefined

  return (
    <Template>
      <TitleText>Introduction</TitleText>
      <SubTitleText>Overview</SubTitleText>
      <BodyText>
        Glaku はシンプルかつミニマムなWebGLライブラリで、ピュアなWebGLが持つパワーを引き出すことを目的にしています。GlakuはWebGL2を前提としたAPIを搭載しており、InstancingやMRTなどを手軽に扱うことができます。
        Enjoy WebGL!
      </BodyText>

      <SubTitleText>Installation</SubTitleText>
      <Syntax lang={undefined}>
        npm i glaku
      </Syntax>

      <SubTitleText>Quick Start</SubTitleText>
      <BodyText>
        以下のサンプルコードを試してみましょう。青い三角形が表示されたら成功です！
        コードの構造はとてもシンプルで、"VAO"と"Program"を用意して"Renderer"に渡しているだけです。
        発展的な実装を行う場合もこの流れから逸脱することはありません。
      </BodyText>
      <Tabs
        value={state}
        options={['Main', 'Vanilla', 'React']}
        onChange={setState}
        tabSx={{textTransform: 'unset'}}
      />
      <Syntax lang='tsx' sandbox={sandbox}>
        {code}
      </Syntax>
      <CaptionText>Core</CaptionText>
      <BodyText>
        ともかくCoreを準備しましょう。CoreのコンストラクタにCanvas(HTMLCanvasElement または OffScreenCanvas)を渡すことで最小限の初期化が完了します。
        CoreはWebGLでレンダリングするための様々な状態を管理していますが、他のクラスから参照して使われることがほとんどなので、直接操作することは少ないかもしれません。
      </BodyText>
      <Syntax lang='tsx'>
        {tutorialCore}
      </Syntax>

      <CaptionText>VAO</CaptionText>
      <BodyText>
        VAOはVertexArrayObjectの略称で、各頂点で扱う属性(attributes)を格納するものです。
        ここではattributesとして、3つの2次元位置座標を定義しています。
        属性(attribute)がどのように使われるかはシェーダー次第です。(3次元座標やRGBをセットするのも自由です)
      </BodyText>
      <Syntax lang='tsx'>
        {tutorialVAO}
      </Syntax>

      <CaptionText>Program</CaptionText>
      <BodyText>
        Programは特に重要なので丁寧に見ていきましょう。Programには2つのGLSLシェーダー(VertexShader / FragmentShader)と、シェーダー内で扱う変数を定義します。
        <br />
        ここでは <code>a_position: "vec2"</code> とすることで、a_position が2次元ベクトルであることをシェーダーに伝えています。
      </BodyText>
      <Syntax lang='tsx'>
        {tutorialProgram}
      </Syntax>

      <BodyText sx={{pt: 2}}>
        GLSLシェーダーの解説を行うには余白が狭すぎるので、次のJavaScript風の疑似コードを元に概要を説明します。
      </BodyText>
      <Syntax lang='tsx'>
        {tutorialGLSL}
      </Syntax>
      <BodyText sx={{pt: 2}}>
        まずattributesは頂点単位に分割されます。
        a_position なら <code>[[0, 1], [1, -1], [-1, -1]]</code> となりますね。
        <br />
        次に、頂点の数だけVertexShaderを実行してレンダリング対象の頂点位置を決定します。
        VertexShaderの実行毎に、分割されたattributesの値を使用することができます。
        今回のシェーダーでは a_position の値をそのまま頂点位置に指定しています。
        <br />
        そしてラスタライズです。ここまでの処理で3つの頂点位置をWebGLに指示しましたが、このままでは点の集合である「面」を表現することができません。
        そこで、頂点で囲まれた「面」に含まれるピクセルをWebGLが内部で自動的に割り出してくれます。
        <br />
        最後に、「面」に含まれるピクセルの数だけFragmentShaderを実行してディスプレイに表示する色を決定します。
        今回は青色を指定しているだけなので、青い三角形が表示されます。
      </BodyText>
      <CaptionText>Renderer</CaptionText>
      <BodyText>
        Rendererは仮想的なディスプレイのようなものです。PixelRatioを指定したり、レンダリング結果をTextureにしたりすることができますが、(FrameBuffer)
        ここでは単純に使うだけなので、以下のように初期化を行った後renderメソッドを実行し、ディスプレイへレンダリングしています。
      </BodyText>
      <Syntax lang='tsx'>
        {tutorialRenderer}
      </Syntax>
      <BodyText sx={{pt: 2}}>
        ここまでの内容でQuick Startの内容を習得することができました、続いて更に実践的なサンプルを見ていきましょう。
      </BodyText>
    </Template>
  )
}

const quickStartMain =
`import { Core, Vao, Program, Renderer } from "glaku";

export const main = (canvas: HTMLCanvasElement) => {
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
};`


const quickStartVanilla =
`import { main } from "./main";

const canvas = document.getElementById("c") as HTMLCanvasElement;
main(canvas);
`

const quickStartReact =
`import { useEffect, useRef } from "react";
import { main } from "./main";

export default function App() {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      main(canvas);
    }
  }, []);
  return <canvas ref={canvasRef} />;
}`

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

const pixels = rasterize(positions)

const renderResult = pixels.map(() => {
  const color = fragmentShader()
  return color
})
`

const tutorialRenderer =
`const renderer = new Renderer(core);
renderer.render(vao, program);
`