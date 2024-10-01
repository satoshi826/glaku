import {useTranslation} from 'react-i18next'
import {BodyText, CaptionText, CaptionText2, SubTitleText, Syntax, TitleText} from '../components'
import {Template} from '../Template'

export default function Page() {
  const {t} = useTranslation()
  return (
    <Template>
      <TitleText >Model</TitleText>
      <BodyText sx={{pt: 3}}>
        {t('extensions.model.overview')}
      </BodyText>
      <SubTitleText >Constructor</SubTitleText>
      <BodyText >
        <Syntax lang='tsx'>
          { `class Model {
  constructor({
    position?: Vec3,
    rotation?: {angle: number, axis: Vec3},
    scale?: Vec3
  })
}`}
        </Syntax>
      </BodyText>
      <CaptionText >Parameters</CaptionText>
      <BodyText >
        <Syntax lang='tsx'>position?: Vec3</Syntax>
        {t('extensions.model.parameters.position')}
        <br/><br/>
        <Syntax lang='tsx'>{'rotation? : {angle: number, axis: Vec3}'}</Syntax>
        {t('extensions.model.parameters.rotation')}
        <br/><br/>
        <Syntax lang='tsx'>scale? : Vec3</Syntax>
        {t('extensions.model.parameters.scale')}
        <br/><br/>
      </BodyText>
      <SubTitleText >Method</SubTitleText>
      <CaptionText >update</CaptionText>
      <Syntax lang='tsx'>
        {'update() : void'}
      </Syntax>
      <BodyText>
        {t('extensions.model.method.update')}
      </BodyText>
      <CaptionText2 >usage</CaptionText2>
      <Syntax lang='tsx'>
        {`const model = new Model();

model.position = [1, 2, 3];
model.rotation = {angle: 45, axis: [0, 1, 0]};
model.scale = [1.5, 1.5, 1.5];

model.update();

program.setUniform({
  u_modelMatrix: model.matrix.m
});`}
      </Syntax>
      <SubTitleText sx={{pb: 1}}>Properties</SubTitleText>
      <BodyText >
        <Syntax lang='tsx'>{'matrix : { m: Mat4 }'}</Syntax>
        {t('extensions.model.properties.matrix')}
        <br/><br/>
        <Syntax lang='tsx'>position?: Vec3</Syntax>
        {t('extensions.model.properties.position')}
        <br/><br/>
        <Syntax lang='tsx'>{'rotation : {angle: number, axis: Vec3}'}</Syntax>
        {t('extensions.model.properties.rotation')}
        <br/><br/>
        <Syntax lang='tsx'>scale? : Vec3</Syntax>
        {t('extensions.model.properties.scale')}
        <br/><br/>
      </BodyText>
      <SubTitleText >Type</SubTitleText>
      <CaptionText >Vec3</CaptionText>
      <Syntax lang='tsx' >
        { 'type Vec3 = [number, number, number]'}
      </Syntax>
      <CaptionText >Mat4</CaptionText>
      <Syntax lang='tsx' >
        { `type Mat4 = [number, number, number, number,
            number, number, number, number,
            number, number, number, number,
            number, number, number, number]`}
      </Syntax>
      <br/>
    </Template>
  )
}