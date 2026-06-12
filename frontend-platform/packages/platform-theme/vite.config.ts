import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({ insertTypesEntry: true })],
  build: {
    lib: {
      // 主题包发布 CSS 变量和基础样式入口，供 platform-ui 与乙方应用统一视觉基线。
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SmartWarehousePlatformTheme',
      formats: ['es', 'umd'],
      fileName: 'index'
    }
  }
})
