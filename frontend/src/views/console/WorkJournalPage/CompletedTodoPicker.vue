<template>
  <a-popover v-model:open="open" trigger="click" placement="bottomLeft">
    <template #content>
      <div class="completed-todo-picker">
        <a-checkbox-group v-model:value="selected" :options="options" />
        <a-empty v-if="!loading && !options.length" :description="error || '当天没有已完成事项'" />
      </div>
      <a-space>
        <a-button v-if="hasMore || error" size="small" :loading="loading" @click="load">{{ error ? '重试' : '加载更多' }}</a-button>
        <a-button type="primary" size="small" :disabled="!selected.length" @click="insert">加入今日完成</a-button>
      </a-space>
    </template>
    <a-button size="small" :disabled="!date">选择已完成待办</a-button>
  </a-popover>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { listCompletedTodos } from '@/services/todo'

const props = defineProps({ date: { type: String, default: '' } })
const emit = defineEmits(['insert'])
const open = ref(false)
const selected = ref([])
const options = ref([])
const total = ref(0)
const loading = ref(false)
const error = ref('')
const page = ref(0)
const hasMore = computed(() => options.value.length < total.value)
let generation = 0

watch([open, () => props.date], () => {
  ++generation
  selected.value = []
  options.value = []
  page.value = total.value = 0
  loading.value = false
  error.value = ''
  if (open.value && props.date) load()
})

async function load() {
  if (loading.value) return
  const version = generation
  loading.value = true
  error.value = ''
  try {
    const result = await listCompletedTodos(props.date, page.value + 1)
    if (version !== generation) return
    options.value.push(...result.items.map((item) => ({ value: item.id, label: item.title })))
    total.value = result.total
    page.value = result.page
  } catch (cause) {
    if (version === generation) error.value = cause.message || '待办读取失败'
  } finally {
    if (version === generation) loading.value = false
  }
}

function insert() {
  emit('insert', options.value.filter((item) => selected.value.includes(item.value)).map((item) => item.label))
  open.value = false
}
</script>

<style scoped>
.completed-todo-picker { max-height: min(42vh, 280px); width: min(72vw, 320px); overflow-y: auto; margin-bottom: 10px; }
.completed-todo-picker :deep(.ant-checkbox-group) { display: grid; gap: 6px; }
</style>
