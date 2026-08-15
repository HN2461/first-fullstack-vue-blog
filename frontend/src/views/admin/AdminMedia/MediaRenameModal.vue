<template>
  <a-modal
    :open="open"
    title="重命名资源"
    :confirm-loading="submitting"
    ok-text="保存名称"
    cancel-text="取消"
    centered
    width="460px"
    :body-style="{ maxHeight: '70vh', overflowY: 'auto' }"
    @update:open="emit('update:open', $event)"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <div v-if="record" class="media-rename__context">
      <div>
        <span>当前资源</span>
        <strong>{{ record.originalName }}</strong>
      </div>
      <a-tag :bordered="false" color="blue">{{ record.category || '未分类' }}</a-tag>
    </div>
    <a-form layout="vertical">
      <a-form-item label="资源名称">
        <a-input
          v-model:value="draftName"
          placeholder="例如：课程封面图、接口示例文档、项目截图 01"
          :maxlength="160"
          show-count
          allow-clear
          @press-enter="handleSubmit"
        />
        <div class="media-rename__note">会同步作为默认下载文件名，但不会改动实际文件和访问地址。</div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  record: {
    type: Object,
    default: null
  },
  submitting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:open', 'submit'])
const draftName = ref('')

watch(
  () => [props.open, props.record],
  ([visible, record]) => {
    if (visible && record) {
      draftName.value = record.originalName || ''
      return
    }

    if (!visible) {
      draftName.value = ''
    }
  },
  { immediate: true }
)

function handleCancel() {
  emit('update:open', false)
}

function handleSubmit() {
  emit('submit', draftName.value)
}
</script>

<style scoped>
.media-rename__context {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  padding: 12px 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.media-rename__context > div {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.media-rename__context span,
.media-rename__note {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.media-rename__context strong {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.media-rename__note {
  margin-top: 8px;
}
</style>
