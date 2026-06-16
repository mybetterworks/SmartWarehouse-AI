<template>
  <section class="sys-route-panel">
    <PlatformTable :columns="columns" :data="riskRecords" row-key="id" show-index />
  </section>
</template>

<script setup lang="ts">
import { PlatformTable } from '@smartwarehouse/platform-ui'
import type { TableColumn } from '@smartwarehouse/platform-types'
import type { SimpleRecord } from '../api'

defineProps<{
  columns: TableColumn[]
  riskRecords: SimpleRecord[]
}>()
</script>
