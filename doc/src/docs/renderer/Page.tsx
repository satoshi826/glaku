import {useTranslation} from 'react-i18next'
import {BodyText, CaptionText, SubTitleText, Syntax, TitleText} from '../components'
import {Template} from '../Template'

export default function Page() {
  const {t} = useTranslation()
  return (
    <Template>
      <TitleText >Renderer</TitleText>
      <BodyText sx={{pt: 3}}>
        {t('api.renderer.overview')}
      </BodyText>
      <SubTitleText >Constructor</SubTitleText>
      <BodyText >
        <Syntax lang='tsx'>
          { `class Renderer {
  constructor(
    core: Core,
    options?: {
      id?: string,
      height?: number,
      width?: number,
      backgroundColor?: [r: number, g: number, b: number, a: number],
      frameBuffer?: TextureArgs[],
      pixelRatio?: number,
      screenFit?: boolean
    }
  )
}`}
        </Syntax>
      </BodyText>
      <CaptionText >Example</CaptionText>
      <Syntax lang='tsx'>
        { `const renderer = new Renderer(core, {
  width: 800,
  height: 600,
  backgroundColor: [0.1, 0.1, 0.1, 1],
  frameBuffer: [RGBA8] //['RGBA', 'RGBA', 'UNSIGNED_BYTE', 'LINEAR', 'CLAMP_TO_EDGE']
  pixelRatio: 2,
  screenFit: true
});`}
      </Syntax>
      <CaptionText >Parameters</CaptionText>
      <BodyText >
        <Syntax lang='tsx'>core: Core</Syntax>
        {t('api.renderer.parameters.core')}
        <br/><br/>
        <Syntax lang='tsx'>id?: string</Syntax>
        {t('api.renderer.parameters.id')}
        <Syntax lang='tsx'>height?: number</Syntax>
        {t('api.renderer.parameters.height')}
        <br/><br/>
        <Syntax lang='tsx'>width?: number</Syntax>
        {t('api.renderer.parameters.width')}
        <br/><br/>
        <Syntax lang='tsx'>backgroundColor?: [r: number, g: number, b: number, a: number]</Syntax>
        {t('api.renderer.parameters.backgroundColor')}
        <br/><br/>
        <Syntax lang='tsx'>frameBuffer?: TextureArgs[]</Syntax>
        {t('api.renderer.parameters.frameBuffer')}
        <br/><br/>
        <Syntax lang='tsx'>pixelRatio? : number</Syntax>
        {t('api.renderer.parameters.pixelRatio')}
        <br/><br/>
        <Syntax lang='tsx'>screenFit?: boolean</Syntax>
        {t('api.renderer.parameters.screenFit')}
        <br/><br/>
      </BodyText>
      <SubTitleText >Method</SubTitleText>
      <CaptionText >clear</CaptionText>
      <Syntax lang='tsx'>
        {'clear(): void'}</Syntax>
      <BodyText>
        {t('api.renderer.method.clear')}
      </BodyText>
      <CaptionText >render</CaptionText>
      <Syntax lang='tsx'>
        {'render(vao: Vao, program: Program): void'}</Syntax>
      <BodyText>
        {t('api.renderer.method.render')}
      </BodyText>
      <SubTitleText sx={{pb: 1}}>Properties</SubTitleText>
      <BodyText>
        <Syntax lang='tsx'>core: Core</Syntax>
        {t('api.renderer.properties.core')}
        <br/><br/>
        <Syntax lang='tsx'>id: string</Syntax>
        {t('api.renderer.properties.id')}
        <br/><br/>
        <Syntax lang='tsx'>pixelRatio: number</Syntax>
        {t('api.renderer.properties.pixelRatio')}
        <br/><br/>
        <Syntax lang='tsx'>width: number</Syntax>
        {t('api.renderer.properties.width')}
        <br/><br/>
        <Syntax lang='tsx'>height: number</Syntax>
        {t('api.renderer.properties.height')}
        <br/><br/>
        <Syntax lang='tsx'>resizeQueue: ResizeArgs | null</Syntax>
        {t('api.renderer.properties.resizeQueue')}
        <br/><br/>
        <Syntax lang='tsx'>backgroundColor: [r: number, g: number, b: number, a: number]</Syntax>
        {t('api.renderer.properties.backgroundColor')}
        <br/><br/>
        <Syntax lang='tsx'>isCanvas: boolean</Syntax>
        {t('api.renderer.properties.isCanvas')}
        <br/><br/>
        <Syntax lang='tsx'>frameBuffer: WebGLFramebuffer | null</Syntax>
        {t('api.renderer.properties.frameBuffer')}
        <br/><br/>
        <Syntax lang='tsx'>depthRenderBuffer: WebGLRenderbuffer | null</Syntax>
        {t('api.renderer.properties.depthRenderBuffer')}
        <br/><br/>
        <Syntax lang='tsx'>renderTexture: TextureWithInfo[]</Syntax>
        {t('api.renderer.properties.renderTexture')}
        <br/><br/>
        <Syntax lang='tsx'>depthTexture: TextureWithInfo | null</Syntax>
        {t('api.renderer.properties.depthTexture')}
        <br/><br/>
        <Syntax lang='tsx'>drawBuffers: number[]</Syntax>
        {t('api.renderer.properties.drawBuffers')}
        <br/><br/>
        <Syntax lang='tsx'>screenFit: boolean</Syntax>
        {t('api.renderer.properties.screenFit')}
        <br/><br/>
      </BodyText>
      <SubTitleText >Constant</SubTitleText>
      <CaptionText >TextureArgs</CaptionText>
      <Syntax lang='tsx' >
        {`const RGBA8 : TextureArgs = ['RGBA', 'RGBA', 'UNSIGNED_BYTE', 'LINEAR', 'CLAMP_TO_EDGE']
const RGBA16F: TextureArgs = ['RGBA16F', 'RGBA', 'HALF_FLOAT', 'LINEAR', 'CLAMP_TO_EDGE']
const RGBA32F: TextureArgs = ['RGBA32F', 'RGBA', 'FLOAT', 'LINEAR', 'CLAMP_TO_EDGE']
const DEPTH: TextureArgs = ['DEPTH_COMPONENT32F', 'DEPTH_COMPONENT', 'FLOAT', 'NEAREST', 'CLAMP_TO_EDGE']`}
      </Syntax>
      <br/>
      <SubTitleText >Type</SubTitleText>
      <CaptionText >TextureArgs</CaptionText>
      <Syntax lang='tsx' >
        { `type TextureArgs = [TextureInternalFormat, TextureFormat, TextureType, TextureFilter, TextureWrap]

type TextureInternalFormat =
  'RGB' | 'RGBA' | 'RGB8' |'RGB16F' |'RGB32F' | 'RGBA8' | 'RGBA16F' | 'RGBA32F'
  | 'DEPTH_COMPONENT16' | 'DEPTH_COMPONENT24' | 'DEPTH_COMPONENT32F' | 'DEPTH24_STENCIL8'
  | 'DEPTH32F_STENCIL8'| 'ALPHA' |'LUMINANCE' |'LUMINANCE_ALPHA'

type TextureFormat =
  'RGB' | 'RGBA' | 'DEPTH_COMPONENT' | 'DEPTH_STENCIL'
  | 'ALPHA' |'LUMINANCE' |'LUMINANCE_ALPHA'

type TextureType = 'SHORT' | 'UNSIGNED_SHORT' | 'BYTE' | 'UNSIGNED_BYTE' | 'HALF_FLOAT' | 'FLOAT'

type TextureFilter =
  'NEAREST' | 'LINEAR' | 'NEAREST_MIPMAP_NEAREST' | 'NEAREST_MIPMAP_LINEAR'
  | 'LINEAR_MIPMAP_NEAREST' | 'LINEAR_MIPMAP_LINEAR'

type TextureWrap = 'REPEAT' | 'MIRRORED_REPEAT' | 'CLAMP_TO_EDGE'
`}
      </Syntax>
      <CaptionText >TextureWithInfo</CaptionText>
      <Syntax lang='tsx' >
        { `type TextureWithInfo = (WebGLTexture & {
  internalFormat: TextureInternalFormat, format: TextureFormat, type: TextureType
})`}
      </Syntax>
      <br/>
    </Template>
  )
}