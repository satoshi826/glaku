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
          Glaku はシンプルかつミニマムなwebGLライブラリで、ピュアなwebGLが持つパワーを引き出すことを目的にしています。Enjoy WebGL !
      </BodyText>
      <SubTitleText>Installation</SubTitleText>
      <Syntax lang={undefined}>
          npm i glaku
      </Syntax>
      <SubTitleText>Quick Start</SubTitleText>
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
      <CaptionText>Core</CaptionText>
      <BodyText >
        なにはともあれ、Glakuを使うためにはまずCoreを初期化しましょう。
        CoreのコンストラクタにCanvas(HTMLCanvasElement または OffScreenCanvas)を渡すことで最小限の初期化が完了します。
        CoreはwebGLでレンダリングするための様々な状態を保持/管理しますが、
        ユーザーが直接操作することは少ないのでここでは詳細を割愛します。
      </BodyText>
      <Syntax lang='tsx'>
        {tutorialCore}
      </Syntax>
      <CaptionText>Renderer</CaptionText>
      <BodyText >
        なにはともあれ、Glakuを使うためにはまずCoreを初期化しましょう。
      </BodyText>
      <Syntax lang='tsx'>
        {tutorialRenderer}
      </Syntax>
    </Template>
  )
}

const quickStartVanilla =
`import { Core, Vao, Program, Renderer } from "glaku";

const canvas = document.getElementById("c");
const core = new Core({ canvas });
const renderer = new Renderer(core);
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
      const renderer = new Renderer(core);
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

const tutorialRenderer =
'const renderer = new Renderer(core);'