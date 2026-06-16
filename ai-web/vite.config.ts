import { fileURLToPath, URL } from 'node:url'
import federation from '@originjs/vite-plugin-federation'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/apps/ai/',
  plugins: [
    vue(),
    federation({
      name: 'smart_ai_web',
      filename: 'remoteEntry.js',
      exposes: {
        './RemoteApp': './src/remote.ts'
      },
      shared: ['vue', 'element-plus', '@element-plus/icons-vue', '@smartwarehouse/platform-ui', '@smartwarehouse/platform-sdk', '@smartwarehouse/platform-theme', '@smartwarehouse/platform-types']
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    cors: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:9200',
        changeOrigin: true
      }
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true
  },
  preview: {
    host: '0.0.0.0',
    port: 5178,
    cors: true
  }
})
