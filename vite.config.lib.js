import path from "path";
import { defineConfig } from "vite";


export default defineConfig({
  build: {
    outDir: "./lib/",
    target: "esnext",
    lib: {
      entry: path.resolve(__dirname, "./src/index.ts"),
      name: "gun-avatar",
    },
  },
  plugins: []
})