import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({ insertTypesEntry: true })],
  build: {
    lib: {
      // 类型包主要产出 .d.ts，少量 JS 入口用于满足 npm 包标准结构。
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SmartWarehousePlatformTypes',
      formats: ['es', 'umd'],
      fileName: 'index'
    }
  }
})
