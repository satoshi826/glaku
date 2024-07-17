import {useEffect, useRef, useState} from 'react'
import {BodyText, CaptionText, SubTitleText, Syntax, TitleText} from '../components'
import {Template} from '../Template'
import {Core, Program, Renderer, Vao} from 'glaku'

export default function Page() {
  // const [state, setState] = useState<'Vanilla' | 'React'>('Vanilla')
  // const code = state === 'Vanilla' ? quickStartVanilla : quickStartReact
  // const sandbox = state === 'Vanilla'
  //   ? 'https://codesandbox.io/p/sandbox/hello-glaku-skgjgf'
  //   : 'https://codesandbox.io/p/sandbox/hello-glaku-react-qf9gj4'

  const canvasRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current) {

      const buildings = [...Array(20)].map(() => ({
        position: [100 * Math.random(), 100 * Math.random()],
        size    : 10 * Math.random()
      }))

      const canvas = canvasRef.current
      const core = new Core({canvas})
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
        id            : 'hello',
        attributeTypes: {a_position: 'vec2'},
        vert          : /* glsl */ `
            void main() {
              gl_Position = vec4(a_position, 1.0, 1.0);
            }`,
        frag: /* glsl */ `
            out vec4 o_color;
            void main() {
              o_color = vec4(0.4, 0.4, 1.0, 1.0);
            }`
      })
      const renderer = new Renderer(core)
      renderer.render(vao, program)
    }
  }, [])


  return (
    <Template>
      <TitleText>Tutorial</TitleText>
      <SubTitleText sx={{pb: 1}}>Goal</SubTitleText>
      <canvas ref={canvasRef} style={{width: '100%', height: '300px'}}/>
    </Template>
  )
}