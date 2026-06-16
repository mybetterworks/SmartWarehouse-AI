import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@smartwarehouse/platform-theme/style.css'
import '@smartwarehouse/platform-ui/style.css'
import { SmartWarehousePlatformUi } from '@smartwarehouse/platform-ui'
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).use(ElementPlus).use(SmartWarehousePlatformUi).mount('#app')
