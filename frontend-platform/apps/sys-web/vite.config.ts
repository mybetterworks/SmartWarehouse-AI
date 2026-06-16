import { fileURLToPath, URL } from 'node:url'
import federation from '@originjs/vite-plugin-federation'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// sys-web 保留独立开发、独立构建和独立调试能力；门户集成时作为 Module Federation remote 由 portal-shell 运行时加载。
export default defineConfig({
  base: '/apps/sys/',
  plugins: [
    vue(),
    federation({
      name: 'smart_sys_web',
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
    port: 5175,
    cors: true
  }
})
