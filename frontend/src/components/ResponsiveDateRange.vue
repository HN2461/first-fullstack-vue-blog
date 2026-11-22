<template>
  <div v-if="appStore.viewportWidth <= 640" class="responsive-date-range" role="group" :aria-label="$attrs['aria-label'] || '日期范围'">
    <a-date-picker
      :value="draft[0]"
      :format="format"
      :value-format="valueFormat"
      :placeholder="placeholder[0]"
      :aria-label="placeholder[0]"
      :size="size"
      :allow-clear="allowClear && !draft[1]"
      :disabled-date="disableStart"
      @change="updateEndpoint(0, $event)"
    />
    <a-date-picker
      :value="draft[1]"
      :format="format"
      :value-format="valueFormat"
      :placeholder="placeholder[1]"
      :aria-label="placeholder[1]"
      :size="size"
      :allow-clear="allowClear"
      :disabled-date="disableEnd"
      @change="updateEndpoint(1, $event)"
    />
  </div>
  <a-range-picker
    v-else
    :value="value"
    :format="format"
    :value-format="valueFormat"
    :placeholder="placeholder"
    :size="size"
    :allow-clear="allowClear"
    @update:value="emit('update:value', $event)"
    @change="emit('change', $event)"
  />
</template>

<script setup>
import { ref, watch } from 'vue'
import dayjs from 'dayjs'
import { useAppStore } from '@/stores/app'

const props = defineProps({
  value: { type: Array, default: undefined },
  format: { type: String, default: 'YYYY-MM-DD' },
  valueFormat: { type: String, default: undefined },
  placeholder: { type: Array, default: () => ['开始日期', '结束日期'] },
  size: { type: String, default: undefined },
  allowClear: { type: Boolean, default: true }
})
const emit = defineEmits(['update:value', 'change'])
const appStore = useAppStore()
const draft = ref([])

watch(() => props.value, (range) => {
  draft.value = [...(range || [])]
}, { immediate: true })

function disableStart(date) {
  return Boolean(draft.value[1] && date.isAfter(dayjs(draft.value[1]), 'day'))
}

function disableEnd(date) {
  return Boolean(draft.value[0] && date.isBefore(dayjs(draft.value[0]), 'day'))
}

function updateEndpoint(index, date) {
  // 窄屏分两次选择，待两端齐全再提交，避免只选一端就触发筛选。
  if (!date) draft.value = []
  else draft.value[index] = date

  if (date && !(draft.value[0] && draft.value[1])) return

  const range = date ? [...draft.value] : null
  emit('update:value', range)
  emit('change', range)
}
</script>

<style scoped>
.responsive-date-range {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  min-width: 0;
}

.responsive-date-range :deep(.ant-picker) {
  min-width: 0;
  width: 100%;
}

.responsive-date-range :deep(.ant-picker-clear) {
  opacity: 1;
}
</style>
