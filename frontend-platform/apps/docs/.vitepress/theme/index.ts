import DefaultTheme from 'vitepress/theme'
import ElementPlus from 'element-plus'
import { ID_INJECTION_KEY, ZINDEX_INJECTION_KEY } from 'element-plus'
import 'element-plus/dist/index.css'
import '@smartwarehouse/platform-theme/style.css'
import '@smartwarehouse/platform-ui/style.css'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.provide(ID_INJECTION_KEY, {
      prefix: 100,
      current: 0
    })
    app.provide(ZINDEX_INJECTION_KEY, {
      current: 0
    })
    app.use(ElementPlus)
  }
}
