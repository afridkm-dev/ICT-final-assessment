import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration with API reverse proxy to Node/Express backend
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
