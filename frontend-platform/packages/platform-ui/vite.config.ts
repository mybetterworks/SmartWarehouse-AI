import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      // node:path 是 Node 内置模块导入方式；这里用于定位组件库入口文件，不会进入浏览器产物。
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SmartWarehousePlatformUi',
      formats: ['es', 'umd'],
      fileName: 'index'
    },
    rollupOptions: {
      // Vue、Element Plus 和平台基础包作为 peer/workspace 依赖外置，避免发布包重复打包这些大依赖。
      external: [
        'vue',
        'element-plus',
        '@element-plus/icons-vue',
        '@smartwarehouse/platform-sdk',
        '@smartwarehouse/platform-theme',
        '@smartwarehouse/platform-theme/style.css',
        '@smartwarehouse/platform-types'
      ],
      output: {
        exports: 'named',
        // UMD 产物需要声明外部依赖在浏览器全局变量中的名称，供极端非模块化场景兜底使用。
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
          '@element-plus/icons-vue': 'ElementPlusIconsVue',
          '@smartwarehouse/platform-sdk': 'SmartWarehousePlatformSdk',
          '@smartwarehouse/platform-theme': 'SmartWarehousePlatformTheme',
          '@smartwarehouse/platform-theme/style.css': 'SmartWarehousePlatformTheme',
          '@smartwarehouse/platform-types': 'SmartWarehousePlatformTypes'
        }
      }
    }
  }
})
