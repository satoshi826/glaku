import {useTranslation} from 'react-i18next'
import {BodyText, CaptionText, CaptionText2, SubTitleText, Syntax, TitleText} from '../components'
import {Template} from '../Template'

export default function Page() {
  const {t} = useTranslation()
  return (
    <Template>
      <TitleText >Core</TitleText>
      <BodyText sx={{pt: 3}}>
        {t('api.core.overview')}
      </BodyText>
      <SubTitleText >Constructor</SubTitleText>
      <BodyText >
        <Syntax lang='tsx'>
          { `class Core {
  constructor({
    canvas: HTMLCanvasElement | OffscreenCanvas,
    pixelRatio?: number,
    resizeListener?: (resizeHandler: (arg: ResizeArgs) => void) => void,
    options?: WebGLEnables[],
    extensions?: string[]
  })
}`}
        </Syntax>
      </BodyText>
      <CaptionText >Example</CaptionText>
      <Syntax lang='tsx'>
        { `const core = new Core({
  canvas: document.getElementById('canvas'),
  pixelRatio: 2,
  resizeListener: (resizeHandler) => {
    const observer = resizeObserver(resizeHandler);
    observer.observe(canvas);
  },
  options: ['DEPTH_TEST', 'STENCIL_TEST', 'CULL_TEST'],
  extensions: ['OES_texture_float']
})`}
      </Syntax>
      <CaptionText >Parameters</CaptionText>
      <BodyText >
        <Syntax lang='tsx'>canvas : HTMLCanvasElement | OffscreenCanvas</Syntax>
        {t('api.core.parameters.canvas')}
        <br/><br/>
        <Syntax lang='tsx'>pixelRatio? : number</Syntax>
        {t('api.core.parameters.pixelRatio')}
        <br/><br/>
        <Syntax lang='tsx'>{'resizeListener?: (resizeHandler: (arg: ResizeArgs) => void) => void'}</Syntax>
        {t('api.core.parameters.resizeListener')}
        <br/><br/>
        <Syntax lang='tsx'>options?: WebGLEnables[]</Syntax>
        {t('api.core.parameters.options')}
        <br/><br/>
        <Syntax lang='tsx'>extensions?: string[]</Syntax>
        {t('api.core.parameters.extensions')}
        <br/><br/>
      </BodyText>
      <SubTitleText >Method</SubTitleText>
      <CaptionText >createTexture</CaptionText>
      <Syntax lang='tsx'>
        {`createTexture(args : {
    filter?: TextureFilter,
    wrap?: TextureWrap,
  } & (
    {image: TexImageSource, array?: undefined, width?: undefined, height?: undefined, format?: undefined, internalFormat?: undefined, type?: undefined} |
    {image?: undefined, array: Float32Array, width: number, height: number, format?: undefined, internalFormat?: TextureInternalFormat, type?: undefined} |
    {image?: undefined, array?: undefined, width: number, height: number, format: TextureFormat, internalFormat: TextureInternalFormat, type: TextureType})) : WebGLTexture`}</Syntax>
      <BodyText>
        {t('api.core.method.createTexture')}
      </BodyText>
      <CaptionText2 sx={{mt: -2}}>Usage</CaptionText2>
      <Syntax lang='tsx'>
        { `// Example 1: Creating a texture from an image
const textureFromImage = core.createTexture({
  image: document.getElementById('myImage') as TexImageSource,
  filter: 'LINEAR',
  wrap: 'CLAMP_TO_EDGE'
});

// Example 2: Creating a floating point texture with raw data
const textureFromArray = core.createTexture({
  array: new Float32Array([1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0]), // 2x2 red and green pixels
  width: 2,
  height: 2,
});

// Example 3: Creating an empty texture with specific format
const emptyTexture = core.createTexture({
  width: 512,
  height: 512,
  format: gl.RGBA,
  internalFormat: gl.RGBA8,
  type: gl.UNSIGNED_BYTE,
  filter: 'LINEAR',
  wrap: 'REPEAT'
});`}
      </Syntax>
      <SubTitleText sx={{pb: 1}}>Properties</SubTitleText>
      <BodyText>
        <Syntax lang='tsx'>gl: WebGL2RenderingContext</Syntax>
        {t('api.core.properties.gl')}
        <br/><br/>
        <Syntax lang='tsx'>canvasWidth: number</Syntax>
        {t('api.core.properties.canvasWidth')}
        <br/><br/>
        <Syntax lang='tsx'>canvasHeight: number</Syntax>
        {t('api.core.properties.canvasHeight')}
        <br/><br/>
        <Syntax lang='tsx'>pixelRatio: number</Syntax>
        {t('api.core.properties.pixelRatio')}
        <br/><br/>
        <Syntax lang='tsx'>{'program: Record<ProgramId, WebGLProgram>'}</Syntax>
        {t('api.core.properties.program')}
        <br/><br/>
        <Syntax lang='tsx'>{'vao: Record<VaoId, WebGLVertexArrayObject & { count: number }>'}</Syntax>
        {t('api.core.properties.vao')}
        <br/><br/>
        <Syntax lang='tsx'>{'uniLoc: Record<ProgramId, Record<UniformName | TextureName, WebGLUniformLocation>>'}</Syntax>
        {t('api.core.properties.uniLoc')}
        <br/><br/>
        <Syntax lang='tsx'>{'attLoc: Record<AttributeName, number>'}</Syntax>
        {t('api.core.properties.attLoc')}
        <br/><br/>
        <Syntax lang='tsx'>{'stride: Record<AttributeName, number | number[]>'}</Syntax>
        {t('api.core.properties.stride')}
        <br/><br/>
        <Syntax lang='tsx'>{'texture: Record<string, {data: WebGLTexture | null, number: number}>'}</Syntax>
        {t('api.core.properties.texture')}
        <br/><br/>
        <Syntax lang='tsx'>{'currentProgram: ProgramId | null'}</Syntax>
        {t('api.core.properties.currentProgram')}
        <br/><br/>
        <Syntax lang='tsx'>{'currentVao: VaoId | null'}</Syntax>
        {t('api.core.properties.currentVao')}
        <br/><br/>
        <Syntax lang='tsx'>{'currentRenderer: RendererId | null'}</Syntax>
        {t('api.core.properties.currentRenderer')}
        <br/><br/>
        <Syntax lang='tsx'>{'uniMethod: typeof uniMethod'}</Syntax>
        {t('api.core.properties.uniMethod')}
        <br/><br/>
        <Syntax lang='tsx'>{'resizeListener: null | ((resizeHandler: (arg: ResizeArgs) => void) => void)'}</Syntax>
        {t('api.core.properties.resizeListener')}
        <br/><br/>
      </BodyText>
      <SubTitleText >Constant</SubTitleText>
      <CaptionText >defaultExtensions</CaptionText>
      <Syntax lang='tsx' >
        {`const defaultExtensions : string[] = [
  'EXT_color_buffer_float',
  'EXT_float_blend',
  'OES_texture_half_float',
  'OES_texture_half_float_linear',
  'OES_texture_float',
  'OES_texture_float_linear',
  'WEBGL_color_buffer_float',
  'WEBGL_depth_texture',
  'MOZ_WEBGL_depth_texture',
  'WEBKIT_WEBGL_depth_texture',
  'WEBGL_multisampled_render_to_texture',
  'WEBGL_draw_buffers'
]`}
      </Syntax>
      <br/>
      <SubTitleText >Type</SubTitleText>
      <CaptionText >ResizeArgs</CaptionText>
      <Syntax lang='tsx' >
        { 'type ResizeArgs = {width?: number, height?: number, pixelRatio?: number}'}
      </Syntax>
      <CaptionText >WebGLEnables</CaptionText>
      <Syntax lang='tsx' >
        { `type WebGLEnables =
  'BLEND' | 'CULL_FACE' | 'DEPTH_TEST' | 'DITHER' | 'POLYGON_OFFSET_FILL' | 'SAMPLE_ALPHA_TO_COVERAGE'
  | 'SAMPLE_COVERAGE' | 'SCISSOR_TEST' | 'STENCIL_TEST'`}
      </Syntax>
      <br/>
    </Template>
  )
}