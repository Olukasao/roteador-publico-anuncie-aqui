import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // media-src/ guarda as fontes HyperFrames dos vídeos da intro (HTML com Three.js por
  // importmap): não é parte do app, então fica fora do scan de dependências e do watcher.
  optimizeDeps: {
    entries: ["index.html"],
  },
  server: {
    port: 5190,
    strictPort: true,
    host: true,
    watch: {
      ignored: ["**/media-src/**"],
    },
  },
});
