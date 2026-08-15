<template>
  <div class="qr-resource">
    <span class="qr-resource__label">{{ label }}</span>
    <div v-if="value?.url" class="qr-resource__selected">
      <a-image :src="value.url" :alt="label" :width="56" :height="56" class="qr-resource__preview" />
      <span>{{ value.name || '已选择二维码资源' }}</span>
      <a-button size="small" @click="openPicker">更换</a-button>
      <a-button size="small" danger @click="clearValue">移除</a-button>
    </div>
    <a-button v-else size="small" @click="openPicker">从媒体资产选择</a-button>

    <a-modal v-model:open="visible" :title="`选择${label}`" :footer="null" :width="720" :body-style="modalBodyStyle" destroy-on-close>
      <div class="qr-picker__toolbar">
        <a-input-search v-model:value="keyword" placeholder="搜索图片名称" allow-clear @search="loadMedia" />
      </div>
      <div class="qr-picker__content">
        <a-spin :spinning="loading">
          <div v-if="items.length" class="qr-picker__grid">
            <button v-for="item in items" :key="item.id" type="button" class="qr-picker__item" @click="selectItem(item)">
              <img :src="item.url" :alt="item.originalName">
              <span>{{ item.originalName }}</span>
            </button>
          </div>
          <a-empty v-else-if="!loading" description="暂无可用图片" />
        </a-spin>
      </div>
      <a-pagination v-if="total > pageSize" v-model:current="page" :page-size="pageSize" :total="total" size="small" @change="loadMedia" />
    </a-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { listAdminMedia } from '@/services/admin'

defineProps({ value: { type: Object, default: () => ({}) }, label: { type: String, default: '二维码' } })
const emit = defineEmits(['update:value'])
const visible = ref(false)
const loading = ref(false)
const keyword = ref('')
const items = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 12
const modalBodyStyle = { maxHeight: '68vh', overflow: 'hidden', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', gap: '14px' }

async function loadMedia() {
  loading.value = true
  try {
    const result = await listAdminMedia({ page: page.value, pageSize, kind: 'image', keyword: keyword.value || undefined })
    items.value = result.items || []
    total.value = result.total || 0
  } catch (error) {
    message.error(error.message || '媒体资源加载失败')
  } finally {
    loading.value = false
  }
}

function openPicker() { visible.value = true; loadMedia() }
function clearValue() { emit('update:value', { mediaId: '', url: '', name: '' }) }
function selectItem(item) {
  emit('update:value', { mediaId: item.id, url: item.url, name: item.originalName })
  visible.value = false
}
</script>

<style scoped>
.qr-resource { display: grid; gap: 8px; }
.qr-resource__label { color: var(--console-text-secondary); font-size: 12px; }
.qr-resource__selected { display: flex; align-items: center; gap: 10px; min-width: 0; }
.qr-resource__selected img { width: 44px; height: 44px; object-fit: cover; border: 1px solid var(--console-border); border-radius: 6px; }
.qr-resource__selected span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--console-text); }
.qr-picker__toolbar { display: flex; }
.qr-picker__content { min-height: 0; overflow-y: auto; scrollbar-width: none; }
.qr-picker__content::-webkit-scrollbar { display: none; }
.qr-picker__grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.qr-picker__item { display: grid; gap: 7px; min-width: 0; padding: 8px; border: 1px solid var(--console-border); border-radius: 8px; background: var(--console-surface); color: var(--console-text); cursor: pointer; text-align: left; }
.qr-picker__item:hover { border-color: var(--console-primary); }
.qr-picker__item img { width: 100%; aspect-ratio: 1; object-fit: contain; background: var(--console-surface-muted); border-radius: 5px; }
.qr-picker__item span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
@media (max-width: 640px) { .qr-picker__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
