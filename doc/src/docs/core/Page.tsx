import {BodyText, CaptionText, SubTitleText, Syntax, TitleText} from '../components'
import {Template} from '../Template'

export default function Page() {
  return (
    <Template>
      <TitleText >Core</TitleText>
      <BodyText sx={{pt: 3}}>
        このクラスは、シェーダーのコンパイル、プログラムのリンク、頂点配列オブジェクト（VAO）、バッファ、およびテクスチャの管理など、WebGLのコア操作を管理します。
      </BodyText>
      <SubTitleText >Constructor</SubTitleText>
      <BodyText >
        <Syntax lang='tsx'>{coreConstructor}</Syntax>
      </BodyText>
      <CaptionText >Constructor</CaptionText>
      <BodyText >
        {`
        Properties
        gl (WebGL2RenderingContext): The WebGL2 context associated with the canvas.
        canvasWidth (number): The width of the canvas.
        canvasHeight (number): The height of the canvas.
        pixelRatio (number): The pixel ratio used for rendering.
        program (Record<ProgramId, WebGLProgram>): A dictionary of compiled WebGL programs.
        vao (Record<VaoId, WebGLVertexArrayObject & {count?: number}>): A dictionary of vertex array objects.
        uniLoc (Record<ProgramId, Record<UniformName | TextureName, WebGLUniformLocation>>): A dictionary of uniform locations.
        attLoc (Record<AttributeName, number>): A dictionary of attribute locations.
        stride (Record<AttributeName, number | number[]>): A dictionary of stride sizes for attributes.
        texture (Record<string, {data: WebGLTexture, number: number}>): A dictionary of textures.
        currentProgram (ProgramId | null): The currently used program.
        currentVao (VaoId | null): The currently bound vertex array object.
        currentRenderer (RendererId | null): The currently used renderer.
        uniMethod (Record<string, [string, boolean, boolean]>): A mapping of uniform types to methods.
        resizeListener (function, optional): A function to handle resize events.
        `}
      </BodyText>
      <SubTitleText >Method</SubTitleText>
    </Template>
  )
}

const coreConstructor =
`Core({
  canvas: HTMLCanvasElement | OffscreenCanvas,
  pixelRatio?: number,
  resizeListener?: (handler: (arg: ResizeArgs) => void) => void,
  options?: WebGLConstants[],
  extensions?: string[]
})
`