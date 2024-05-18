import {resolve} from 'path'
import {defineConfig} from 'vite'

export default defineConfig({
  build: {
    sourcemap: true,
    emptyOutDir: true,
    lib        : {
      entry   : resolve(__dirname, 'src/index.ts'),
      name    : 'jittoku',
      fileName: 'index',
      formats : ['es']
    }
  }
})