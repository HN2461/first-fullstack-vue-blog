<template>
  <a-select
    :value="value"
    :options="options"
    :title="selectedName"
    :bordered="bordered"
    :allow-clear="allowClear"
    class="ledger-book-select"
    popup-class-name="ledger-book-select-popup"
    :dropdown-match-select-width="false"
    :dropdown-style="{ width: '360px', maxWidth: 'calc(100vw - 32px)' }"
    :virtual="false"
    show-search
    option-filter-prop="label"
    @update:value="$emit('update:value', $event)"
    @change="$emit('change', $event)"
    @clear="handleClear"
  />
</template>

<script setup>
import { computed } from 'vue'

// 下拉选项允许多行名称，关闭固定行高的虚拟列表以保持滚动与键盘选择准确。
const props = defineProps({
  value: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  bordered: { type: Boolean, default: true },
  allowClear: { type: Boolean, default: false },
  clearValue: { type: String, default: 'all' }
})

const emit = defineEmits(['update:value', 'change'])
const selectedName = computed(() => props.options.find((item) => item.value === props.value)?.label || '')

function handleClear() {
  emit('update:value', props.clearValue)
  emit('change', props.clearValue)
}
</script>

<style scoped>
.ledger-book-select {
  width: 280px;
  max-width: 100%;
  min-width: 0;
}

.ledger-book-select--form {
  width: 100%;
}

@media (max-width: 760px) {
  .ledger-book-select {
    width: 100% !important;
  }
}

:global(.ledger-book-select-popup .ant-select-item-option-content) {
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.6;
}
</style>
