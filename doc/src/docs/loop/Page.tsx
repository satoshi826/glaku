import {useTranslation} from 'react-i18next'
import {BodyText, CaptionText, CaptionText2, SubTitleText, Syntax, TitleText} from '../components'
import {Template} from '../Template'

export default function Page() {
  const {t} = useTranslation()
  return (
    <Template>
      <TitleText >Loop</TitleText>
      <BodyText sx={{pt: 3}}>
        {t('extensions.loop.overview')}
      </BodyText>
      <SubTitleText >Constructor</SubTitleText>
      <BodyText >
        <Syntax lang='tsx'>
          { `class Loop {
  constructor({
    callback: (args: { delta: number, drawTime: number, elapsed: number}) => void,
    interval?: number
  })
}`}
        </Syntax>
      </BodyText>
      <CaptionText >Parameters</CaptionText>
      <BodyText >
        <Syntax lang='tsx'>{'callback : (args: { delta: number, drawTime: number, elapsed: number}) => void'}</Syntax>
        {t('extensions.loop.parameters.callback')}
        <br/><br/>
        <Syntax lang='tsx'>interval? : number</Syntax>
        {t('extensions.loop.parameters.interval')}
        <br/><br/>
      </BodyText>
      <SubTitleText >Method</SubTitleText>
      <CaptionText >start</CaptionText>
      <Syntax lang='tsx'>
        {'start() : void'}
      </Syntax>
      <BodyText>
        {t('extensions.loop.method.start')}
      </BodyText>
      <CaptionText2 >usage</CaptionText2>
      <Syntax lang='tsx'>
        {`const loop = new Loop({
  callback: ({delta, drawTime, elapsed}) => {
    console.log(\`Delta: \${delta}, Draw Time: \${drawTime}, Elapsed: \${elapsed}\`);
  },
  interval: 1000 / 60
});
loop.start();`}
      </Syntax>
    </Template>
  )
}