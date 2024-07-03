import {BodyText, SubTitleText, TitleText} from '../components'
import {Template} from '../Template'

export default function Page() {
  return (
    <Template>
      <TitleText >Program</TitleText>
      <SubTitleText >Overview</SubTitleText>
      <BodyText >
          Glaku はシンプルかつミニマムなwebGLライブラリで、ピュアなwebGLが持つパワーを引き出すことを目的にしています。Enjoy WebGL !
      </BodyText>
    </Template>
  )
}