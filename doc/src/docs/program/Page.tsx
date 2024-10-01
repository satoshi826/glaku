import {useTranslation} from 'react-i18next'
import {BodyText, CaptionText, CaptionText2, SubTitleText, Syntax, TitleText} from '../components'
import {Template} from '../Template'

export default function Page() {
  const {t} = useTranslation()
  return (
    <Template>
      <TitleText >Program</TitleText>
      <BodyText sx={{pt: 3}}>
        {t('api.program.overview')}
      </BodyText>
      <SubTitleText >Constructor</SubTitleText>
      <BodyText >
        <Syntax lang='tsx'>
          { `class Program {
  constructor(
    core: Core,
    options: {
      id?: ProgramId,
      attributeTypes: Record<AttributeName, AttributeType>,
      uniformTypes?: Record<UniformName, UniformTypeWithArray>,
      vert: string,
      frag: string,
      texture?: Record<TextureName, WebGLTexture>,
      primitive?: PrimitiveTypes
    }
  )
}`}
        </Syntax>
      </BodyText>
      <CaptionText >Example</CaptionText>
      <Syntax lang='tsx'>
        { `const program = new Program(core, {
  id: 'example',
  attributeTypes: {
    a_position: 'vec2',
  },
  uniformTypes: {
    u_color: 'vec3',
    u_offset: 'vec2'
  },
  vert: \`
    void main() {
      gl_Position = vec4(a_position + u_offset, 0.0, 1.0);
    }
  \`,
  frag: \`
    out vec4 color;
    void main() {
      color = vec4(u_color, 1.0);
    }
  \`
});`}
      </Syntax>
      <CaptionText >Parameters</CaptionText>
      <BodyText >
        <Syntax lang='tsx'>core: Core</Syntax>
        {t('api.program.parameters.core')}
        <br/><br/>
        <Syntax lang='tsx'>id?: string</Syntax>
        {t('api.program.parameters.id')}
        <br/><br/>
        <Syntax lang='tsx'>{'attributeTypes: Record<AttributeName, AttributeType>'}</Syntax>
        {t('api.program.parameters.attributeTypes')}
        <br/><br/>
        <Syntax lang='tsx'>{'uniformTypes?: Record<UniformName, UniformTypeWithArray>'}</Syntax>
        {t('api.program.parameters.uniformTypes')}
        <br/><br/>
        <Syntax lang='tsx'>vert: string</Syntax>
        {t('api.program.parameters.vert')}
        <br/><br/>
        <Syntax lang='tsx'>frag: string</Syntax>
        {t('api.program.parameters.frag')}
        <br/><br/>
        <Syntax lang='tsx'>{'texture?: Record<TextureName, WebGLTexture>'}</Syntax>
        {t('api.program.parameters.texture')}
        <br/><br/>
        <Syntax lang='tsx'>primitive?: PrimitiveTypes</Syntax>
        {t('api.program.parameters.primitive')}
        <br/><br/>
      </BodyText>
      <SubTitleText >Method</SubTitleText>
      <CaptionText >setUniform</CaptionText>
      <Syntax lang='tsx'>
        {'setUniform(uniformValues: Record<UniformName, number | number[]>): void'}</Syntax>
      <BodyText>
        {t('api.program.method.setUniform')}
      </BodyText>
      <CaptionText2 sx={{mt: -2}}>Usage</CaptionText2>
      <Syntax lang='tsx'>
        { `program.setUniform({
  u_color: [1, 0, 0],
  u_offset: [0.5, 0.5]
});`}
      </Syntax>
      <CaptionText >setTexture</CaptionText>
      <Syntax lang='tsx'>
        {'setTexture(texture: Record<TextureName, WebGLTexture>): void'}</Syntax>
      <BodyText >
        {t('api.program.method.setTexture')}
      </BodyText>
      <CaptionText2 sx={{mt: -2}}>Usage</CaptionText2>
      <Syntax lang='tsx'>
        { 'program.setTexture({t_tex: document.getElementById(\'myImage\') as TexImageSource});'}
      </Syntax>
      <SubTitleText sx={{pb: 1}}>Properties</SubTitleText>
      <BodyText>
        <Syntax lang='tsx'>core: Core</Syntax>
        {t('api.program.properties.core')}
        <br/><br/>
        <Syntax lang='tsx'>id: string</Syntax>
        {t('api.program.properties.id')}
        <br/><br/>
        <Syntax lang='tsx'>vert: string</Syntax>
        {t('api.program.properties.vert')}
        <br/><br/>
        <Syntax lang='tsx'>frag: string</Syntax>
        {t('api.program.properties.frag')}
        <br/><br/>
        <Syntax lang='tsx'>{'uniforms: Record<UniformName | TextureName, {type: UniformTypeWithArray, value: null | number | number[], dirty: boolean}>'}</Syntax>
        {t('api.program.properties.uniforms')}
        <br/><br/>
        <Syntax lang='tsx'>primitive: PrimitiveTypes</Syntax>
        {t('api.program.properties.primitive')}
      </BodyText>
      <SubTitleText >Type</SubTitleText>
      <CaptionText >ProgramId</CaptionText>
      <Syntax lang='tsx' >
        { 'type ProgramId = string'}
      </Syntax>
      <CaptionText >AttributeName</CaptionText>
      <Syntax lang='tsx' >
        { 'type AttributeName = `a_${string}`'}
      </Syntax>
      <CaptionText >UniformName</CaptionText>
      <Syntax lang='tsx' >
        { 'type UniformName = `u_${string}`'}
      </Syntax>
      <CaptionText >UniformType</CaptionText>
      <Syntax lang='tsx'>
        { 'type UniformType = \'bool\' | \'int\' | \'float\' | \'vec2\' | \'vec3\' | \'vec4\' | \'mat2\' | \'mat3\' | \'mat4\' | \'ivec2\' | \'ivec3\' | \'ivec4\'' }
      </Syntax>
      <CaptionText >UniformTypeWithArray</CaptionText>
      <Syntax lang='tsx'>
        { 'type UniformTypeWithArray = UniformType | `${UniformType}[${number}]`' }
      </Syntax>
      <CaptionText >TextureName</CaptionText>
      <Syntax lang='tsx' >
        { 'type TextureName = `t_${string}`'}
      </Syntax>
      <CaptionText >PrimitiveTypes</CaptionText>
      <Syntax lang='tsx' >
        { 'type PrimitiveTypes = \'TRIANGLES\' | \'POINTS\' | \'LINES\' | \'LINE_STRIP\' | \'LINE_LOOP\' | \'TRIANGLE_STRIP\' | \'TRIANGLE_FAN\''}
      </Syntax>
      <br/>
    </Template>
  )
}