import {useEffect, useRef, useState} from 'react'
import {BodyText, CaptionText, SubTitleText, Syntax, TitleText} from '../components'
import {Template} from '../Template'
import {Core, Loop, Program, Renderer, resizeObserver, State, Vao} from 'glaku'

export default function Page() {
  // const [state, setState] = useState<'Vanilla' | 'React'>('Vanilla')
  // const code = state === 'Vanilla' ? quickStartVanilla : quickStartReact
  // const sandbox = state === 'Vanilla'
  //   ? 'https://codesandbox.io/p/sandbox/hello-glaku-skgjgf'
  //   : 'https://codesandbox.io/p/sandbox/hello-glaku-react-qf9gj4'

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {

    let core : Core | null = null

    if (canvasRef.current && !core) {

      const canvas = canvasRef.current
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const resizeState = new State({width, height})
      const ro = resizeObserver((args) => resizeState.set(args))
      ro.observe(canvas)

      const random = (min = 0, max = 1) => Math.random() * (max - min) + min

      const rects = [...Array(50)].map(() => ({
        position  : [random(-40, 40), random(-40, 40), random(0.1, 1)],
        offsetTime: random(-100, 100)
      }))

      core = new Core({canvas,
        resizeListener: (fn) => resizeState.on(fn),
        options       : ['DEPTH_TEST', 'CULL_FACE']
      })
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
        uniformTypes  : {
          u_elapsed        : 'float',
          u_aspectRatio    : 'vec2',
          u_position_offset: 'vec3',
          u_offset_time    : 'float'
          // u_mouse      : 'vec2'
        },
        vert: /* glsl */ `
            out float z;
            void main() {
              vec2 pos = (a_position / u_position_offset.z + u_position_offset.xy) / u_aspectRatio * 0.05;
              float y = pos.y + 2.0 * sin(0.0002 * u_elapsed / u_position_offset.z + u_offset_time);
              vec2 movedPos = vec2(pos.x, y);
              gl_Position = vec4(movedPos, u_position_offset.z, 1.0);
            }`,
        frag: /* glsl */ `
            out vec4 o_color;
            void main() {
              o_color = vec4(vec3(1.0 - u_position_offset.z), 1.0);
            }`
      })

      resizeState.on(({width, height}) => {
        const aspectRatio = width / height
        const aspectRatioVec = aspectRatio > 1 ? [aspectRatio, 1] : [1, 1 / aspectRatio]
        program.setUniform({
          u_aspectRatio: aspectRatioVec
        })
      })

      const renderer = new Renderer(core, {backgroundColor: [0, 0, 0, 1]})

      const animation = new Loop({callback: ({elapsed}) => {
        renderer.clear()
        program.setUniform({u_elapsed: elapsed})
        rects.forEach((rect) => {
          program.setUniform({
            u_position_offset: rect.position,
            u_offset_time    : rect.offsetTime
          })
          renderer.render(vao, program)
        })
      }})
      animation.start()
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