import { defineConfig } from 'vitepress'
import {
  componentCatalog,
  componentGroups,
  scenarioTemplateCatalog,
  scenarioTemplateGroups,
  type CatalogGroupMeta,
  type CatalogItemMeta
} from '../src/componentCatalog'

function itemLink(item: CatalogItemMeta, overviewPath: string): string {
  return item.docsPath ?? `${overviewPath}#${item.slug}`
}

function createSidebar(groups: CatalogGroupMeta[], items: CatalogItemMeta[], overview: { text: string; link: string }) {
  return [
    {
      text: overview.text,
      items: [{ text: overview.text, link: overview.link }]
    },
    ...groups.map((group) => ({
      text: group.name,
      items: items
        .filter((item) => item.group === group.key)
        .map((item) => ({
          text: `${item.name} ${item.title}`,
          link: itemLink(item, overview.link)
        }))
    }))
  ]
}

export default defineConfig({
  title: 'SmartWarehouse-AI Platform UI',
  description: 'Enterprise component library documentation for SmartWarehouse-AI.',
  base: '/',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: '组件', link: '/component/overview' },
      { text: '场景模板', link: '/scenario/overview' },
    ],
    outline: {
      label: 'CONTENTS',
      level: [2, 3]
    },
    sidebar: {
      '/component/': createSidebar(componentGroups, componentCatalog, {
        text: '组件总览',
        link: '/component/overview'
      }),
      '/scenario/': createSidebar(scenarioTemplateGroups, scenarioTemplateCatalog, {
        text: '场景模板总览',
        link: '/scenario/overview'
      })
    }
  }
})
