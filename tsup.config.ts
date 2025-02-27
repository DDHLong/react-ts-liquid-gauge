import { defineConfig } from "tsup";
import { TsconfigPathsPlugin } from "@esbuild-plugins/tsconfig-paths";

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
  plugins: [
    TsconfigPathsPlugin({
      tsconfig: "./tsconfig.json",
    }),
  ],
  external: ["react", "react-dom"],
});
