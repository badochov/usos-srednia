import { readFileSync } from 'node:fs'

import { crx } from '@crxjs/vite-plugin'
import { defineConfig } from 'vite'
import zipPack from 'vite-plugin-zip-pack'
import manifest from './src/manifest.json' with { type: 'json' }

const { version } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
)

const plugins = [crx({ manifest: { ...manifest, version } })]

if (process.env.RELEASE === 'true') {
  plugins.push(
    zipPack({
      inDir: 'dist',
      outDir: 'releases',
      outFileName: `usos-srednia-${version}.zip`,
    }),
  )
}

export default defineConfig({
  root: 'src',
  plugins,
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})