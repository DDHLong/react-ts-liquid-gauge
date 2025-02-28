import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: {
    resolve: true,
  },
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  sourcemap: true,
  minify: true,
  target: "esnext",
  outDir: "dist",
  tsconfig: "tsconfig.app.json",
  external: ["react", "react-dom"],
});
