import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "./dist",
    target: "esnext",
    lib: {
      entry: path.resolve(__dirname, "./src/index.ts"),
      name: "gun-avatar",
    },
  },
})