import { defineConfig } from "vite";

export default defineConfig({
  root: ".", // index.html location
  base: process.env.NODE_ENV === "production" ? "/ToDo/" : "/",
  server: {
    open: true, // open browser automatically
  },
  build: {
    outDir: "./dist", // ← 出力先を外側に出したい場合
    emptyOutDir: true,
  },
});
