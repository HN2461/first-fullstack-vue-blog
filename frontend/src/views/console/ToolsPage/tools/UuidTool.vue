<template>
  <section class="tool-panel uuid-tool">
    <div class="tool-panel__toolbar">
      <a-input-number v-model:value="count" :min="1" :max="20" size="small" addon-before="数量" />
      <div class="tool-panel__actions"><a-button size="small" type="primary" @click="generate">生成</a-button><a-button size="small" @click="copyAll">复制全部</a-button></div>
    </div>
    <div class="uuid-list"><code v-for="item in values" :key="item">{{ item }}</code></div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'

const count = ref(5)
const values = ref([])

function generate() {
  values.value = Array.from({ length: count.value }, () => crypto.randomUUID())
}

async function copyAll() {
  if (!values.value.length) generate()
  await navigator.clipboard?.writeText(values.value.join('\n'))
  message.success('已复制 UUID')
}

generate()
</script>

<style scoped>
.tool-panel { display: grid; gap: 14px; max-width: 860px; }
.tool-panel__toolbar, .tool-panel__actions { display: flex; align-items: center; gap: 8px; }
.tool-panel__toolbar { justify-content: space-between; }
.uuid-list { display: grid; gap: 7px; }
.uuid-list code { padding: 10px 12px; border: 1px solid var(--console-border, #e5e7eb); border-radius: 6px; color: var(--console-primary, #1677ff); background: var(--console-surface-muted, #f8fafc); font: 13px/1.4 'Cascadia Code', Consolas, monospace; }
</style>
