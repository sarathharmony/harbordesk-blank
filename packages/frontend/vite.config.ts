import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND_PORT = process.env.BACKEND_PORT ?? '3000';
const BACKEND_TARGET = process.env.VITE_API_TARGET ?? `http://localhost:${BACKEND_PORT}`;
const VITE_PORT = Number(process.env.VITE_PORT ?? 5173);

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: VITE_PORT,
    proxy: {
      '/gateway-api': {
        target: 'http://127.0.0.1:3002',
        changeOrigin: true,
        ws: true,
        rewrite: (p) => p.replace(/^\/gateway-api/, ''),
      },
      '/platform-api': {
        target: 'http://127.0.0.1:3002',
        changeOrigin: true,
      },
      '/api': {
        target: BACKEND_TARGET,
        changeOrigin: true,
      },
    },
  },
});
