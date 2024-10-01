import {useTranslation} from 'react-i18next'
import {BodyText, CaptionText, CaptionText2, SubTitleText, Syntax, TitleText} from '../components'
import {Template} from '../Template'

export default function Page() {
  const {t} = useTranslation()
  return (
    <Template>
      <TitleText >Camera</TitleText>
      <BodyText sx={{pt: 3}}>
        {t('extensions.camera.overview')}
      </BodyText>
      <SubTitleText >Constructor</SubTitleText>
      <BodyText >
        <Syntax lang='tsx'>
          { `class Camera {
  constructor({
    position?: Vec3,
    lookAt?: Vec3,
    up?: Vec3,
    fov?: number,
    near?: number,
    far?: number,
    aspect?: number
  })
}`}
        </Syntax>
      </BodyText>
      <CaptionText >Parameters</CaptionText>
      <BodyText >
        <Syntax lang='tsx'>position?: Vec3</Syntax>
        {t('extensions.camera.parameters.position')}
        <br/><br/>
        <Syntax lang='tsx'>lookAt?: Vec3</Syntax>
        {t('extensions.camera.parameters.lookAt')}
        <br/><br/>
        <Syntax lang='tsx'>up?: Vec3</Syntax>
        {t('extensions.camera.parameters.up')}
        <br/><br/>
        <Syntax lang='tsx'>fov?: number</Syntax>
        {t('extensions.camera.parameters.fov')}
        <br/><br/>
        <Syntax lang='tsx'>near?: number</Syntax>
        {t('extensions.camera.parameters.near')}
        <br/><br/>
        <Syntax lang='tsx'>far?: number</Syntax>
        {t('extensions.camera.parameters.far')}
        <br/><br/>
        <Syntax lang='tsx'>aspect?: number</Syntax>
        {t('extensions.camera.parameters.aspect')}
        <br/><br/>
      </BodyText>
      <SubTitleText >Method</SubTitleText>
      <CaptionText >update</CaptionText>
      <Syntax lang='tsx'>
        {'update() : void'}
      </Syntax>
      <BodyText>
        {t('extensions.camera.method.update')}
      </BodyText>
      <CaptionText2 >usage</CaptionText2>
      <Syntax lang='tsx'>
        {`const camera = new Camera();

camera.position = [2, 3, 5];
camera.lookAt = [0, -1, 0];
camera.up = [0, 1, 0];
camera.fov = 75;
camera.near = 1;
camera.far = 1000;
camera.aspect = 16 / 9;

camera.update();

program.setUniform({
  u_vpMatrix: camera.matrix.vp,
  u_vMatrix: camera.matrix.v
})`}
      </Syntax>
      <SubTitleText sx={{pb: 1}}>Properties</SubTitleText>
      <BodyText >
        <Syntax lang='tsx'>{'matrix : {v: Mat4, p: Mat4, vp: Mat4}'}</Syntax>
        {t('extensions.camera.properties.matrix')}
        <br/><br/>
        <Syntax lang='tsx'>position: Vec3</Syntax>
        {t('extensions.camera.properties.position')}
        <br/><br/>
        <Syntax lang='tsx'>lookAt: Vec3</Syntax>
        {t('extensions.camera.properties.lookAt')}
        <br/><br/>
        <Syntax lang='tsx'>up: Vec3</Syntax>
        {t('extensions.camera.properties.up')}
        <br/><br/>
        <Syntax lang='tsx'>fov: number</Syntax>
        {t('extensions.camera.properties.fov')}
        <br/><br/>
        <Syntax lang='tsx'>near: number</Syntax>
        {t('extensions.camera.properties.near')}
        <br/><br/>
        <Syntax lang='tsx'>far: number</Syntax>
        {t('extensions.camera.properties.far')}
        <br/><br/>
        <Syntax lang='tsx'>aspect: number</Syntax>
        {t('extensions.camera.properties.aspect')}
        <br/><br/>
      </BodyText>
      <SubTitleText >Type</SubTitleText>
      <CaptionText >Vec3</CaptionText>
      <Syntax lang='tsx' >
        { 'type Vec3 = [number, number, number]'}
      </Syntax>
      <br/>
    </Template>
  )
}