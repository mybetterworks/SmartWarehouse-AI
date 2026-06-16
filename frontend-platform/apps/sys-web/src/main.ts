import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@smartwarehouse/platform-theme/style.css'
import '@smartwarehouse/platform-ui/style.css'
import { SmartWarehousePlatformUi } from '@smartwarehouse/platform-ui'
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// sys-web 作为独立甲方前端项目运行，不引用 packages 源码，只使用 @smartwarehouse/* 包入口。
createApp(App).use(ElementPlus).use(SmartWarehousePlatformUi).mount('#app')
