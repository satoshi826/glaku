import {useTranslation} from 'react-i18next'
import {BodyText, CaptionText, SubTitleText, Syntax, TitleText} from '../components'
import {Template} from '../Template'

export default function Page() {
  const {t} = useTranslation()
  return (
    <Template>
      <TitleText >Shape</TitleText>
      <BodyText sx={{pt: 3}}>
        {t('extensions.shape.overview')}
      </BodyText>
      <SubTitleText >Function</SubTitleText>
      <CaptionText >plane</CaptionText>
      <Syntax lang='tsx'>
        {'function plane(): Shape'}
      </Syntax>
      <BodyText>
        {t('extensions.shape.plane')}
      </BodyText>
      <CaptionText >box</CaptionText>
      <Syntax lang='tsx'>
        {'function box(): Shape'}
      </Syntax>
      <BodyText>
        {t('extensions.shape.box')}
      </BodyText>
      <CaptionText >sphere</CaptionText>
      <Syntax lang='tsx'>
        {'function sphere(row: number, column: number, rad: number): Shape'}
      </Syntax>
      <BodyText>
        {t('extensions.shape.sphere')}
      </BodyText>
      <CaptionText >plane2D</CaptionText>
      <Syntax lang='tsx'>
        {'function plane2D(): { attributes: Omit<Attribute, \'a_normal\'>, index: number[] }'}
      </Syntax>
      <BodyText>
        {t('extensions.shape.plane2D')}
      </BodyText>
      <SubTitleText >Type</SubTitleText>
      <CaptionText >Shape</CaptionText>
      <Syntax lang='tsx'>
        { `type Shape = {
  attributes: Attribute,
  index: number[],
}`}
      </Syntax>
      <CaptionText >Attribute</CaptionText>
      <Syntax lang='tsx'>
        { `type Attribute = {
  a_position: number[],
  a_normal: number[],
  a_textureCoord: number[],
}`}
      </Syntax>
    </Template>
  )
}