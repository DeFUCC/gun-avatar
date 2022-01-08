import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "./dist",
    lib: {
      entry: path.resolve(__dirname, "main.js"),
      name: "gun-avatar",
    },
    rollupOptions: {},
  },
});
