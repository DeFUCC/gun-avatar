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
          exclude: ["**/examples/**/*", "/node_modules/"],
          fileExtensions: ["vue", "ts"],
        },
      }),
      Icons({
        /* options */
      }),
      Components({
        dirs: ["./"],
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
      },
    };
  }

  if (mode == "page") {
    return {
      ...config,
      build: {
        outDir: "./demo",
      },
    };
  }
  return config;
});
