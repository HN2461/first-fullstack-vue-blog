<template>
  <a-modal
    :open="open"
    :title="isBatch ? '批量迁移资源分类' : '调整资源分类'"
    :confirm-loading="submitting"
    ok-text="确认迁移"
    cancel-text="取消"
    centered
    width="500px"
    :body-style="{ maxHeight: '70vh', overflow: 'hidden' }"
    @update:open="emit('update:open', $event)"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <div class="media-category-move">
      <div class="media-category-move__context">
        <template v-if="isBatch">
          <span>待迁移资源</span>
          <strong>已选择 {{ selectedCount }} 个媒体文件</strong>
        </template>
        <template v-else>
          <span>当前资源</span>
          <strong>{{ record?.originalName || '未选择资源' }}</strong>
        </template>
      </div>

      <a-form layout="vertical">
        <a-form-item label="目标分类" required>
          <a-select
            v-model:value="targetCategory"
            show-search
            option-filter-prop="label"
            placeholder="选择目标资源分类"
            :options="categoryOptions"
          />
        </a-form-item>
      </a-form>

      <p class="media-category-move__note">仅调整媒体库归档分类，不会修改文件地址、物理文件或现有引用。</p>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  record: { type: Object, default: null },
  selectedCount: { type: Number, default: 0 },
  categories: { type: Array, default: () => [] },
  submitting: { type: Boolean, default: false }
})

const emit = defineEmits(['update:open', 'submit'])
const targetCategory = ref(undefined)
const isBatch = computed(() => props.selectedCount > 0)
const categoryOptions = computed(() => props.categories
  .filter((item) => item.id)
  .map((item) => ({
    label: item.description ? `${item.name} - ${item.description}` : item.name,
    value: item.name
  })))

watch(
  () => [props.open, props.record, props.selectedCount],
  ([visible, record, selectedCount]) => {
    if (!visible) {
      targetCategory.value = undefined
      return
    }

    targetCategory.value = selectedCount > 0 ? undefined : record?.category || undefined
  },
  { immediate: true }
)

function handleCancel() {
  emit('update:open', false)
}

function handleSubmit() {
  if (!targetCategory.value) {
    message.warning('请选择目标资源分类')
    return
  }

  emit('submit', targetCategory.value)
}
</script>

<style scoped>
.media-category-move {
  max-height: min(60vh, 460px);
  overflow-y: auto;
  padding-right: 2px;
  scrollbar-width: none;
}

.media-category-move::-webkit-scrollbar {
  display: none;
}

.media-category-move__context {
  display: grid;
  gap: 4px;
  margin-bottom: 18px;
  padding: 12px 14px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface-muted);
}

.media-category-move__context span,
.media-category-move__note {
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.media-category-move__context strong {
  color: var(--console-text);
  font-size: 14px;
  overflow-wrap: anywhere;
}

.media-category-move__note {
  margin: 0;
}
</style>
