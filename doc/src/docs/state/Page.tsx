import {useTranslation} from 'react-i18next'
import {BodyText, CaptionText, SubTitleText, Syntax, TitleText} from '../components'
import {Template} from '../Template'

export default function Page() {
  const {t} = useTranslation()
  return (
    <Template>
      <TitleText >State</TitleText>
      <BodyText sx={{pt: 3}}>
        {t('extensions.state.overview')}
      </BodyText>
      <SubTitleText >Constructor</SubTitleText>
      <BodyText >
        <Syntax lang='tsx'>
          { `class State {
  constructor(init: T)
}`}
        </Syntax>
      </BodyText>
      <CaptionText >Example</CaptionText>
      <Syntax lang='tsx'>
        { 'const numberState = new State(0);'}
      </Syntax>
      <CaptionText >Parameters</CaptionText>
      <BodyText >
        <Syntax lang='tsx'>init: T</Syntax>
        {t('extensions.state.parameters.init')}
        <br/><br/>
      </BodyText>
      <SubTitleText >Method</SubTitleText>
      <CaptionText >get</CaptionText>
      <Syntax lang='tsx'>
        {'get(): T'}</Syntax>
      <BodyText>
        {t('extensions.state.method.get')}
      </BodyText>
      <CaptionText >set</CaptionText>
      <Syntax lang='tsx'>
        {'set(value: T): void'}
      </Syntax>
      <BodyText>
        {t('extensions.state.method.set')}
      </BodyText>
      <CaptionText >on</CaptionText>
      <Syntax lang='tsx'>
        {'on(handler: Handler<T>): () => void'}
      </Syntax>
      <BodyText>
        {t('extensions.state.method.on')}
      </BodyText>
      <CaptionText >off</CaptionText>
      <Syntax lang='tsx'>
        {'off(handler: Handler<T>): void'}
      </Syntax>
      <BodyText>
        {t('extensions.state.method.off')}
      </BodyText>
      <CaptionText >clear</CaptionText>
      <Syntax lang='tsx'>
        {'clear(): void'}
      </Syntax>
      <BodyText>
        {t('extensions.state.method.clear')}
      </BodyText>
      <SubTitleText >Usage</SubTitleText>
      <Syntax lang='tsx'>
        {`const state = new State(0);

const off = state.on(value => {
  console.log(\`State changed to: \${value}\`);
});

state.set(5); // Logs: "State changed to: 5"

// To stop listening to state changes
off();
        `}
      </Syntax>
    </Template>
  )
}