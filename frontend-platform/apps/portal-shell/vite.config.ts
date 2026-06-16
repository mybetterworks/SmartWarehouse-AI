import { fileURLToPath, URL } from 'node:url'
import federation from '@originjs/vite-plugin-federation'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// portal-shell 是甲方门户独立应用，开发期通过 Vite proxy 访问 gateway，生产期由 Nginx / 阿里弹性容器注入网关地址。
export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'smart_portal_shell',
      // remotes 使用运行时注册；保留一个未使用占位 remote，让插件生成 virtual:__federation__ 运行时 API。
      remotes: {
        __runtime_placeholder__: {
          external: '/__unused_remote_entry__.js',
          externalType: 'url',
          format: 'esm',
          from: 'vite'
        }
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
  }
})
