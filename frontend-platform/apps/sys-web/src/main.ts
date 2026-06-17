import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import '@smartwarehouse/platform-theme/style.css'
import '@smartwarehouse/platform-ui/style.css'
import { SmartWarehousePlatformUi } from '@smartwarehouse/platform-ui'
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).use(ElementPlus, { locale: zhCn }).use(SmartWarehousePlatformUi).mount('#app')
