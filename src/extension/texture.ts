import {Core} from '..'

export const imageToTexture = (core: Core, image: TexImageSource) => {
  const {gl} = core
  const tex = core.gl.createTexture()!
  if (!tex) throw new Error('failed to create texture')
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  gl.generateMipmap(gl.TEXTURE_2D)
  gl.bindTexture(gl.TEXTURE_2D, null)
  return tex
}