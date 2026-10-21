import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-сервер проксирует /api на локальный WildFly.
// Адрес приложения (с контекстом) меняется через frontend/.env.local: BACKEND_URL=http://localhost:8080/lab-is
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const backend = new URL(env.BACKEND_URL || 'http://localhost:8080/lab-is');
  const contextPath = backend.pathname.replace(/\/$/, '');

  return {
    // Относительные пути к ассетам: контекст приложения на сервере заранее неизвестен.
    base: './',
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backend.origin,
          changeOrigin: true,
          rewrite: (path: string) => contextPath + path,
        },
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  };
});
