import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/open5e-api': {
        target: 'https://api.open5e.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/open5e-api/, '/v2')
      }
    }
  }
});