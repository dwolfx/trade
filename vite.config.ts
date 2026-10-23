import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createLiveNewsPlugin } from './src/server/liveNewsServer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), createLiveNewsPlugin()],
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api/yahoo': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    }
  }
});
