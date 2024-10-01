import {useTranslation} from 'react-i18next'
import {BodyText, CaptionText, CaptionText2, SubTitleText, Syntax, TitleText} from '../components'
import {Template} from '../Template'

export default function Page() {
  const {t} = useTranslation()
  return (
    <Template>
      <TitleText >VAO</TitleText>
      <BodyText sx={{pt: 3}}>
        {t('api.vao.overview')}
      </BodyText>
      <SubTitleText >Constructor</SubTitleText>
      <BodyText >
        <Syntax lang='tsx'>
          { `class Vao {
  constructor(
    core: Core,
    options: {
      id?: VaoId,
      attributes: Record<AttributeName, number[]>,
      index?: number[],
      instancedAttributes?: AttributeName[],
      maxInstance?: number
    }
  )
}`}
        </Syntax>
      </BodyText>
      <CaptionText >Example</CaptionText>
      <Syntax lang='tsx'>
        { `const vao = new Vao(core, {
  id: 'example',
  attributes: {
    a_position: [0, 0, 1, 1, -1, -1]
  },
  index: [0, 1, 2],
  instancedAttributes: ['a_offset'],
  maxInstance: 100
});
`}
      </Syntax>
      <CaptionText >Parameters</CaptionText>
      <BodyText >
        <Syntax lang='tsx'>core: Core</Syntax>
        {t('api.vao.parameters.core')}
        <br/><br/>
        <Syntax lang='tsx'>id?: string</Syntax>
        {t('api.vao.parameters.id')}
        <br/><br/>
        <Syntax lang='tsx'>{'attributes: Record<AttributeName, number[]>'}</Syntax>
        {t('api.vao.parameters.attributes')}
        <br/><br/>
        <Syntax lang='tsx'>index?: number[]</Syntax>
        {t('api.vao.parameters.index')}
        <br/><br/>
        <Syntax lang='tsx'>instancedAttributes?: AttributeName[]</Syntax>
        {t('api.vao.parameters.instancedAttributes')}
        <br/><br/>
        <Syntax lang='tsx'>maxInstance? : number</Syntax>
        {t('api.vao.parameters.maxInstance')}
        <br/><br/>
      </BodyText>
      <SubTitleText >Method</SubTitleText>
      <CaptionText >setInstancedValues</CaptionText>
      <Syntax lang='tsx'>
        {'setInstancedValues(instancedValue: Record<AttributeName, number[]>): void'}</Syntax>
      <BodyText>
        {t('api.vao.method.setInstancedValues')}
      </BodyText>
      <CaptionText2 sx={{mt: -2}}>Usage</CaptionText2>
      <Syntax lang='tsx'>
        {
          `const vao = new Vao(core, {
  id: 'instancing_example_vao',
  attributes: {
    a_position: [0, 1, 1, -1, -1, -1]
  },
  instancedAttributes: ['a_offset'],
  maxInstance: 3
});
vao.setInstancedValues({a_offset: [0, 0, 0.5, 0.5, -0.5, -0.5]);

const program = new Program(core, {
  id: 'instancing_example_program',
  attributeTypes: {
    a_position: 'vec2',
    a_offset: 'vec2',
  },
  vert: \`
    void main() {
      gl_Position = vec4(a_position + a_offset, 0.0, 1.0);
    }
  \`,
  frag: \`
    void main() {
      color = vec4(1.0);
    }
 \`
});

renderer.render(vao, program) // Render three triangles at a time

`
        }
      </Syntax>
      <SubTitleText sx={{pb: 1}}>Properties</SubTitleText>
      <BodyText>
        <Syntax lang='tsx'>core: Core</Syntax>
        {t('api.vao.properties.core')}
        <br/><br/>
        <Syntax lang='tsx'>id: string</Syntax>
        {t('api.vao.properties.id')}
        <br/><br/>
        <Syntax lang='tsx'>{'attributes: Record<AttributeName, number[]>'}</Syntax>
        {t('api.vao.properties.attributes')}
        <br/><br/>
        <Syntax lang='tsx'>index: number[] | undefined</Syntax>
        {t('api.vao.properties.index')}
        <br/><br/>
        <Syntax lang='tsx'>{'maxInstance: number'}</Syntax>
        {t('api.vao.properties.maxInstance')}
        <br/><br/>
        <Syntax lang='tsx'>{'instancedAttributes: Record<AttributeName, {array: Float32Array | null, vbo: WebGLBuffer | null, dirty: boolean}>'}</Syntax>
        {t('api.vao.properties.instancedAttributes')}
        <br/><br/>
        <Syntax lang='tsx'>instancedCount: number | null</Syntax>
        {t('api.vao.properties.instancedCount')}
        <br/><br/>
      </BodyText>
      <SubTitleText >Type</SubTitleText>
      <CaptionText >VaoId</CaptionText>
      <Syntax lang='tsx' >
        { 'type VaoId = string'}
      </Syntax>
      <CaptionText >AttributeName</CaptionText>
      <Syntax lang='tsx' >
        { 'type AttributeName = `a_${string}`'}
      </Syntax>
      <br/>
    </Template>
  )
}