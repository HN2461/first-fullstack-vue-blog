<template>
  <a-modal :open="open" title="选择文件" :footer="null" width="min(980px, 90vw)" centered wrap-class-name="business-modal" @cancel="$emit('update:open', false)">
    <div class="resource-picker">
      <BlogTable :columns="columns" :api-fn="load" :params="params" :page-size="12" :auto-load="false" ref="tableRef" :scroll="{ x: 600 }" height="min(48vh, 480px)" :show-column-setting="false">
        <template #toolbar><a-input-search v-model:value="keyword" placeholder="搜索文件名" allow-clear @search="search" /></template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'actions'">
            <a-button type="link" @click="preview = record">预览</a-button>
            <a-button type="link" :disabled="selectedIds.includes(record.id)" @click="select(record)">{{ selectedIds.includes(record.id) ? '已选择' : '选择' }}</a-button>
          </template>
        </template>
      </BlogTable>
    </div>
    <ResourcePreview :open="!!preview" :resource="preview" @update:open="preview = null" />
  </a-modal>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import BlogTable from '@/components/BlogTable.vue'
import ResourcePreview from './ResourcePreview.vue'
import http from '@/services/http'

const props = defineProps({ open: Boolean, scene: { type: String, default: 'article-resource' }, selectedIds: { type: Array, default: () => [] } })
const emit = defineEmits(['update:open', 'select'])
const keyword = ref('')
const submittedKeyword = ref('')
const tableRef = ref(null)
const preview = ref(null)
const params = computed(() => ({ scene: props.scene, keyword: submittedKeyword.value }))
const columns = [{ title: '文件名', dataIndex: 'originalName', key: 'name', ellipsis: true }, { title: '分类', dataIndex: 'category', key: 'category', width: 140 }, { title: '操作', key: 'actions', width: 150 }]
async function load(params) {
  return http.get('/api/resources', { params })
}
function reload() { tableRef.value?.reload().catch((error) => message.error(error.message || '文件列表加载失败')) }
function search() {
  const value = keyword.value.trim()
  if (value === submittedKeyword.value) reload()
  else submittedKeyword.value = value
}
function select(record) {
  emit('select', record)
  emit('update:open', false)
}
watch(() => props.open, async (open) => {
  if (open) {
    await nextTick()
    reload()
  }
}, { immediate: true })
</script>

<style scoped>
.resource-picker { max-height: 65vh; overflow: auto; }
</style>
