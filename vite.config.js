import path from "path";
import { defineConfig } from "vite";
import Components from "unplugin-vue-components/vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import Vue from "@vitejs/plugin-vue";
import Unocss from 'unocss/vite'
import { presetUno, presetIcons, transformerDirectives, extractorSplit } from "unocss";
import extractorPug from '@unocss/extractor-pug'

export default defineConfig({
  base: "./",
  build: {
    outDir: "./demo",
    optimizeDeps: {
      include: [
        "gun",
        "gun/gun",
        "gun/sea",
        "gun/sea.js",
        "gun/lib/then",
        "gun/lib/webrtc",
        "gun/lib/radix",
        "gun/lib/radisk",
        "gun/lib/store",
        "gun/lib/rindexed",
      ],
    },
  },
  plugins: [
    Vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag == 'gun-avatar'
        }
      }
    }),
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
    Icons({
      /* options */
    }),
    Components({
      dirs: ["src/demo/components/"],
      extensions: ["html", "vue"],
      directoryAsNamespace: true,
      globalNamespaces: ["global"],
      include: [/\.vue$/, /\.vue\?vue/, /\.html$/],
      exclude: [/node_modules/, /\.git/],
      resolvers: [
        IconsResolver({
          componentPrefix: "",
        }),
      ],
    }),
  ],
})



function moduleExclude(match) {
  const m = (id) => id.indexOf(match) > -1;
  return {
    name: `exclude-${match}`,
    resolveId(id) {
      if (m(id)) return id;
    },
    load(id) {
      if (m(id)) return `export default {}`;
    },
  };
}