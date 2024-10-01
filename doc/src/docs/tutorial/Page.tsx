import {useEffect} from 'react'
import {BodyText, CaptionText, NavigationButton, SandboxButton, SubTitleText, SyntaxTsx, TitleText, TransWithCode} from '../components'
import {Template} from '../Template'
import Worker from '../worker?worker'
import {useCanvas} from '../../useCanvas'
import {resizeObserver} from 'glaku'
import {Box, Divider, Typography} from '@mui/material'
import {useTranslation} from 'react-i18next'


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
  const {t} = useTranslation()

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
        {t('tutorial.header')}
      </BodyText>

      <SubTitleText >{t('tutorial.renderOrb.title')}</SubTitleText>
      <CanvasWrapper sandbox='https://codesandbox.io/p/sandbox/tutorial-render-orb-s7c8ps'>
        {canvas2}
      </CanvasWrapper>
      <CaptionText>{t('tutorial.renderOrb.resizeResolution.title')}</CaptionText>
      <BodyText >
        <TransWithCode>tutorial.renderOrb.resizeResolution.body</TransWithCode>
      </BodyText>
      <SyntaxTsx>
        {tutorialRenderOrb_core}
      </SyntaxTsx>
      <CaptionText>{t('tutorial.renderOrb.prepareRect.title')}</CaptionText>
      <BodyText >
        <TransWithCode>tutorial.renderOrb.prepareRect.body</TransWithCode>
      </BodyText>
      <SyntaxTsx>
        {tutorialRenderOrb_vao}
      </SyntaxTsx>
      <CaptionText>{t('tutorial.renderOrb.createProgram.title')}</CaptionText>
      <Typography variant='body1' sx={{pb: 1}}>Uniform</Typography>
      <BodyText >
        <TransWithCode>tutorial.renderOrb.createProgram.uniform</TransWithCode>
      </BodyText>
      <Typography variant='body1' sx={{pb: 1}}>Varying</Typography>
      <BodyText >
        <TransWithCode>tutorial.renderOrb.createProgram.varying</TransWithCode>
      </BodyText>
      <Typography variant='body1' sx={{pb: 1}}>FragmentShader</Typography>
      <BodyText >
        <TransWithCode>tutorial.renderOrb.createProgram.fragment</TransWithCode>
      </BodyText>
      <SyntaxTsx>
        {tutorialRenderOrb_program}
      </SyntaxTsx>
      <CaptionText>{t('tutorial.renderOrb.resizeAspect.title')}</CaptionText>
      <BodyText >
        <TransWithCode>tutorial.renderOrb.resizeAspect.body</TransWithCode>
      </BodyText>
      <SyntaxTsx>
        {tutorialRenderOrb_render}
      </SyntaxTsx>

      <SubTitleText >{t('tutorial.rotateOrb.title')}</SubTitleText>
      <CanvasWrapper sandbox='https://codesandbox.io/p/sandbox/tutorial-rotate-orb-c7vp38'>
        {canvas3}
      </CanvasWrapper>
      <CaptionText>{t('tutorial.rotateOrb.rotateByTime.title')}</CaptionText>
      <BodyText >
        <TransWithCode>tutorial.rotateOrb.rotateByTime.body</TransWithCode>
      </BodyText>
      <SyntaxTsx>
        {tutorialRotateOrb_program}
      </SyntaxTsx>
      <CaptionText>{t('tutorial.rotateOrb.animation.title')}</CaptionText>
      <BodyText >
        <TransWithCode>tutorial.rotateOrb.animation.body</TransWithCode>
      </BodyText>
      <SyntaxTsx>
        {tutorialRotateOrb_render}
      </SyntaxTsx>

      <SubTitleText >{t('tutorial.increaseOrb.title')}</SubTitleText>
      <CanvasWrapper sandbox='https://codesandbox.io/p/sandbox/tutorial-many-orb-43gt6p'>
        {canvas4}
      </CanvasWrapper>
      <CaptionText>{t('tutorial.increaseOrb.blending.title')}</CaptionText>
      <BodyText >
        <TransWithCode>tutorial.increaseOrb.blending.body</TransWithCode>
      </BodyText>
      <SyntaxTsx>
        {tutorialManyOrb_core}
      </SyntaxTsx>
      <CaptionText>{t('tutorial.increaseOrb.scaleOrb.title')}</CaptionText>
      <BodyText >
        <TransWithCode>tutorial.increaseOrb.scaleOrb.body</TransWithCode>
      </BodyText>
      <SyntaxTsx >
        {tutorialManyOrb_program}
      </SyntaxTsx>
      <CaptionText>{t('tutorial.increaseOrb.renderMultiOrb.title')}</CaptionText>
      <BodyText >
        <TransWithCode>tutorial.increaseOrb.renderMultiOrb.body</TransWithCode>
      </BodyText>
      <SyntaxTsx >
        {tutorialManyOrb_render}
      </SyntaxTsx>
      <Divider sx={{pt: 4}}/>
      <Box py={2} display='flex' justifyContent='left'>
        <NavigationButton caption='Previous Page' title='Introduction' href='/introduction'/>
      </Box>
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
  options: ["BLEND"], // gl.enable(gl.BLEND)
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
