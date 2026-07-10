import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), cloudflare()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
