import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@smartwarehouse/platform-theme/style.css'
import '@smartwarehouse/platform-ui/style.css'
import { SmartWarehousePlatformUi } from '@smartwarehouse/platform-ui'
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// 门户应用只通过 @smartwarehouse/* 包名导入平台能力，保持后续切换 npm 私库制品时不改业务代码。
createApp(App).use(ElementPlus).use(SmartWarehousePlatformUi).mount('#app')
