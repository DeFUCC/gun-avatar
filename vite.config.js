import { defineConfig } from "vite";
import Unocss from 'unocss/vite'
import { presetUno, presetIcons, transformerDirectives, extractorSplit } from "unocss";
import extractorPug from '@unocss/extractor-pug'

export default defineConfig({
  base: "./",
  build: {
    outDir: "./demo",
  },
  plugins: [
    Unocss({
      presets: [
        presetIcons({
          extraProperties: {
            'display': 'inline-block',
            'vertical-align': 'middle',
          },
        }),
        presetUno()
      ],
      transformers: [
        transformerDirectives(),
      ],
      extractors: [
        extractorPug(),
        extractorSplit,
      ],
    }),

  ],
})
