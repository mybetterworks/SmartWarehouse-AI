import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({ insertTypesEntry: true })],
  build: {
    lib: {
      // SDK 以 src/index.ts 作为唯一出口，保证 request、token、permission 等能力从同一入口发布。
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SmartWarehousePlatformSdk',
      formats: ['es', 'umd'],
      fileName: 'index'
    },
    rollupOptions: {
      // 类型包只在编译期约束数据结构，运行时不需要被打进 SDK 产物。
      external: ['@smartwarehouse/platform-types']
    }
  }
})
