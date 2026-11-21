<template>
  <a-popover trigger="click" placement="bottomRight" title="编辑与对比">
    <template #content>
      <div class="developer-editor-options">
        <a-checkbox :checked="wrap" @update:checked="emit('update:wrap', $event)">自动换行</a-checkbox>
        <a-checkbox :checked="syncScroll" @update:checked="emit('update:syncScroll', $event)">同步滚动</a-checkbox>
        <a-checkbox :checked="resultOnly" @update:checked="emit('update:resultOnly', $event)">仅查看结果</a-checkbox>
        <div class="developer-editor-options__commands">
          <a-button size="small" @click="emit('command', 'search-input')">查找 / 替换输入</a-button>
          <a-button size="small" @click="emit('command', 'search-output')">查找结果</a-button>
          <a-button size="small" @click="emit('command', 'undo')">撤销输入</a-button>
          <a-button size="small" @click="emit('command', 'redo')">重做输入</a-button>
          <a-button v-if="foldable" size="small" @click="emit('command', 'fold-output')">折叠结果</a-button>
          <a-button v-if="foldable" size="small" @click="emit('command', 'unfold-output')">展开结果</a-button>
        </div>
        <small>Ctrl / ⌘ + Enter 执行，Ctrl / ⌘ + F 查找。</small>
      </div>
    </template>
    <a-tooltip title="换行、同步滚动与编辑器操作"><a-button type="text" size="small" aria-label="编辑器与对比设置"><template #icon><Settings2 :size="16" /></template></a-button></a-tooltip>
  </a-popover>
</template>

<script setup>
import { Settings2 } from '@lucide/vue'
defineProps({ wrap: Boolean, syncScroll: Boolean, resultOnly: Boolean, foldable: Boolean })
const emit = defineEmits(['update:wrap', 'update:syncScroll', 'update:resultOnly', 'command'])
</script>

<style scoped>
.developer-editor-options { display: flex; flex-direction: column; gap: 10px; max-width: min(300px, calc(100vw - 64px)); }
.developer-editor-options :deep(.ant-checkbox-wrapper) { margin-inline-start: 0; }
.developer-editor-options__commands { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; padding-top: 10px; border-top: 1px solid var(--console-border); }
.developer-editor-options small { color: var(--console-text-secondary); font-size: 12px; }
</style>
