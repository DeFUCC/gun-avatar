import path from "path";
import { defineConfig } from "vite";
import Components from "unplugin-vue-components/vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import WindiCSS from "vite-plugin-windicss";

export default defineConfig(({ command, mode }) => {
  const config = {
    base: "./",
    plugins: [
      WindiCSS({
        scan: {
          dirs: ["src"],
          exclude: ["/node_modules/"],
          fileExtensions: ["vue", "ts"],
        },
      }),
      Icons({
        /* options */
      }),
      Components({
        dirs: ["src"],
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
  };

  if (mode == "production") {
    return {
      ...config,
      build: {
        outDir: "./dist",
        lib: {
          entry: path.resolve(__dirname, "./src/main.js"),
          name: "gun-avatar",
        },
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
    };
  }

  if (mode == "page") {
    return {
      ...config,
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
    };
  }
  return config;
});



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