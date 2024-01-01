import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      entryRoot: "src/lib",
    }),
    solid(),
  ],
  build: {
    lib: {
      entry: "src/lib/index.tsx",
      name: "solid-simple-popover",
      fileName: "index",
      formats: ["es"],
    },
    emptyOutDir: true,
    outDir: "dist",
    minify: false,
    rollupOptions: {
      external: ["solid-js", "solid-js/web", "@floating-ui/dom"],
    },
  },
});
