import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    base: '/',
    plugins: [react(), tailwindcss()],

    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    preview: {
      host: '0.0.0.0',
      port: process.env.PORT || 4173,
      allowedHosts: true
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',

      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true
        }
      },

      watch: {
        ignored: ['**/data/**']
      }
    },
  };
});
