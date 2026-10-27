import { defineConfig, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';

const target = process.env.API_PROXY_TARGET || 'http://127.0.0.1:8787';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    fs: { allow: [searchForWorkspaceRoot(process.cwd())] },
    proxy: { '/api': { target, changeOrigin: true }, '/health': { target, changeOrigin: true } },
  },
  build: { outDir: 'dist', emptyOutDir: true },
});