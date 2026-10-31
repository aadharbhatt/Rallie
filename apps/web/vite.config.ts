import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const configDir = dirname(fileURLToPath(import.meta.url));
const target = process.env.API_PROXY_TARGET || 'http://127.0.0.1:8787';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    // Let the Worker own API CORS; Vite's default must not add allow-origin to denied responses.
    cors: false,
    port: 5173,
    strictPort: true,
    fs: { strict: false, allow: [resolve(configDir, '../..')] },
    proxy: { '/api': { target, changeOrigin: true }, '/health': { target, changeOrigin: true } },
  },
  build: { outDir: 'dist', emptyOutDir: true },
});