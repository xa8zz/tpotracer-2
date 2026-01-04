import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxy /api requests to backend in development
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Add API key header to proxied requests
              if (env.VITE_API_KEY) {
                proxyReq.setHeader('x-api-key', env.VITE_API_KEY);
              }
            });
          },
        },
      },
    },
  };
});
