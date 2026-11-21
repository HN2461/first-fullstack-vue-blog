<template>
  <section class="tool-panel uuid-tool">
    <div class="uuid-toolbar">
      <div class="uuid-options">
        <label for="tool-uuid-count">生成数量</label>
        <a-input-number id="tool-uuid-count" v-model:value="count" :min="1" :max="1000" size="small" />
      </div>
      <div class="uuid-actions">
        <a-button size="small" :disabled="!values.length" @click="copyAll">复制全部</a-button>
        <a-button size="small" type="primary" @click="generate">生成</a-button>
      </div>
    </div>
    <a-alert v-if="error" type="error" show-icon :message="error" />
    <div class="uuid-result-head"><span>生成结果</span><span>{{ values.length }} 项 · UUID v4</span></div>
    <ol class="uuid-list" aria-label="UUID 生成结果">
      <li v-for="(item, index) in values" :key="item">
        <span class="uuid-index">{{ index + 1 }}</span>
        <code>{{ item }}</code>
        <a-tooltip title="复制 UUID">
          <a-button type="text" size="small" aria-label="复制此 UUID" @click="copyToolResult(item, 'UUID')">
            <template #icon><Copy :size="14" /></template>
          </a-button>
        </a-tooltip>
      </li>
    </ol>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { Copy } from '@lucide/vue'
import { copyToolResult } from '../utils/copyToolResult'
import { generateUuids } from '../logic/randomTools'

const count = ref(5)
const values = ref([])
const error = ref('')

function generate() {
  error.value = ''
  try {
    values.value = generateUuids(count.value)
  } catch (cause) {
    values.value = []
    error.value = cause.message
  }
}

function copyAll() {
  return copyToolResult(values.value.join('\n'), '全部 UUID')
}

generate()
</script>

<style scoped>
.uuid-tool { display: flex; flex: 1; flex-direction: column; gap: 12px; min-width: 0; min-height: 0; overflow: hidden; }
.uuid-toolbar, .uuid-options, .uuid-actions, .uuid-result-head { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; flex: 0 0 auto; }
.uuid-toolbar, .uuid-result-head { justify-content: space-between; }
.uuid-options, .uuid-result-head { color: var(--console-text-secondary); font-size: 12px; }
.uuid-options :deep(.ant-input-number) { width: 96px; }
.uuid-list { display: flex; flex: 1; flex-direction: column; gap: 7px; min-height: 0; margin: 0; padding: 0 2px 0 0; overflow: auto; list-style: none; scrollbar-gutter: stable; }
.uuid-list li { display: flex; align-items: center; gap: 10px; flex: 0 0 auto; min-height: 42px; padding: 6px 8px 6px 12px; border: 1px solid var(--console-border); border-radius: 6px; }
.uuid-index { flex: 0 0 18px; color: var(--console-text-tertiary); font-size: 12px; }
.uuid-list code { flex: 1; min-width: 0; overflow-wrap: anywhere; color: var(--console-text); font: 13px/1.5 'Cascadia Code', Consolas, monospace; }
.uuid-tool > :deep(.ant-alert) { flex: 0 0 auto; }
</style>
