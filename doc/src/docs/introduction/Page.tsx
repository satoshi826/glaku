import {useState} from 'react'
import {BodyText, CaptionText, NavigationButton, SubTitleText, Syntax, TitleText, TransWithCode} from '../components'
import {Tabs} from '../../components/Tabs'
import {Template} from '../Template'
import {Accordion, AccordionDetails, AccordionSummary, Box, Divider, Icon, Typography} from '@mui/material'
import {useTranslation} from 'react-i18next'

export default function Page() {
  const {t} = useTranslation()
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
        {t('introduction.overview.header')}
      </BodyText>
      <Typography component='li' sx={{color: '#aaa', pb: 1.5}}><strong style={{color: '#f0f0f0'}}>Simple API: </strong>
        {t('introduction.overview.simpleAPI')}
      </Typography>
      <Typography component='li' sx={{color: '#aaa', pb: 1.5}}><strong style={{color: '#f0f0f0'}}>WebGL2 Powered: </strong>
        {t('introduction.overview.webGL2Powered')}
      </Typography>
      <Typography component='li' sx={{color: '#aaa', pb: 1.5}}><strong style={{color: '#f0f0f0'}}>Zero Dependencies: </strong>
        {t('introduction.overview.zeroDependencies')}
      </Typography>
      <Typography component='li' sx={{color: '#aaa'}}><strong style={{color: '#f0f0f0'}}>Fully Typed: </strong>
        {t('introduction.overview.fullyTyped')}
      </Typography>
      <SubTitleText>Installation</SubTitleText>
      <Syntax lang={undefined}>
        npm i glaku
      </Syntax>
      <SubTitleText>Quick Start</SubTitleText>
      <BodyText sx={{mb: 1}}>
        <TransWithCode >introduction.quickStart</TransWithCode>
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
      <Accordion sx={{mt: 3}}>
        <AccordionSummary expandIcon={<Icon>arrow_drop_down</Icon>}>
          <BodyText sx={{mb: 0}}>{t('introduction.fyi.summary')}</BodyText>
        </AccordionSummary>
        <AccordionDetails>
          <Syntax lang='tsx' sandbox={'https://codesandbox.io/p/sandbox/hello-glaku-pure-webgl-xlcg8z'}>
            {quickStartRaw}
          </Syntax>
          <BodyText sx={{mt: 3}}>{t('introduction.fyi.conclusion')}</BodyText>
        </AccordionDetails>
      </Accordion>
      <CaptionText>Core</CaptionText>
      <BodyText>
        {t('introduction.core')}
      </BodyText>
      <Syntax lang='tsx'>
        {tutorialCore}
      </Syntax>

      <CaptionText>VAO</CaptionText>
      <BodyText>
        {t('introduction.VAO')}
      </BodyText>
      <Syntax lang='tsx'>
        {tutorialVAO}
      </Syntax>

      <CaptionText>Program</CaptionText>
      <BodyText>
        <TransWithCode>introduction.program.1</TransWithCode>
      </BodyText>
      <Syntax lang='tsx'>
        {tutorialProgram}
      </Syntax>

      <BodyText sx={{pt: 2}}>
        {t('introduction.program.2')}
      </BodyText>
      <Syntax lang='tsx'>
        {tutorialGLSL}
      </Syntax>
      <BodyText sx={{pt: 2}}>
        <TransWithCode>introduction.program.3</TransWithCode>
      </BodyText>
      <CaptionText>Renderer</CaptionText>
      <BodyText>
        {t('introduction.renderer')}
      </BodyText>
      <Syntax lang='tsx'>
        {tutorialRenderer}
      </Syntax>
      <BodyText sx={{pt: 2}}>
        {t('introduction.conclusion')}
      </BodyText>
      <Divider/>
      <Box py={2} display='flex' justifyContent='right'>
        <NavigationButton caption='Next Page' title='Tutorial' href='/tutorial'/>
      </Box>
    </Template>
  )
}

const quickStartMain =
`import { Core, Vao, Program, Renderer } from "glaku";

export const main = (canvas: HTMLCanvasElement) => {
  const core = new Core({ canvas });

  const vao = new Vao(core, {
    attributes: { a_position: [0, 1, 1, -1, -1, -1] },
  });

  const program = new Program(core, {
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

const quickStartRaw =
`export const main = (canvas: HTMLCanvasElement) => {
  const gl = canvas.getContext("webgl2")!;

  const vertShaderSource = /* glsl */ \`#version 300 es
    in vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 1.0, 1.0);
    }
  \`;

  const fragShaderSource = /* glsl */ \`#version 300 es
    precision mediump float;
    out vec4 o_color;
    void main() {
      o_color = vec4(0.4, 0.4, 1.0, 1.0);
    }
  \`;

  const createShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const createProgram = (gl, vertShader, fragShader) => {
    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return null;
    }
    return program;
  };

  const vertShader = createShader(gl, gl.VERTEX_SHADER, vertShaderSource);
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragShaderSource);
  const program = createProgram(gl, vertShader, fragShader);

  const positions = new Float32Array([0, 1, 1, -1, -1, -1]);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
};
`

const tutorialCore =
`const canvas = document.getElementById("c");
const core = new Core({ canvas });
`

const tutorialVAO =
`const vao = new Vao(core, {
  attributes: { a_position: [0, 1, 1, -1, -1, -1] },
});
`

const tutorialProgram =
`const program = new Program(core, {
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

const positions = vertexes.map(attribute => {
  const position = vertexShader(attribute)
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