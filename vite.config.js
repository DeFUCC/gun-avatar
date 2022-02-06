import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => {
  const config = {
    base: "./",
  };

  if (mode == "production") {
    return {
      ...config,
      build: {
        outDir: "./dist",
        lib: {
          entry: path.resolve(__dirname, "main.js"),
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
