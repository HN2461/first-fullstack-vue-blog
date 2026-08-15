<template>
  <a-modal
    :open="open"
    title="批量下载媒体"
    ok-text="生成下载包"
    cancel-text="取消"
    :confirm-loading="submitting"
    :ok-button-props="{ disabled: !canSubmit }"
    width="620px"
    centered
    :body-style="{ maxHeight: '68vh', overflowY: 'auto' }"
    @update:open="emit('update:open', $event)"
    @cancel="emit('update:open', false)"
    @ok="handleSubmit"
  >
    <a-form layout="vertical">
      <a-form-item label="压缩包名称">
        <a-input v-model:value="draft.archiveName" :maxlength="80" show-count allow-clear>
          <template #suffix>.zip</template>
        </a-input>
      </a-form-item>

      <a-form-item>
        <template #label>
          <span class="media-download-label">
            文件命名方式
            <a-tooltip title="只调整下载包内的文件名，不会修改媒体库名称、服务器文件或资源地址。">
              <QuestionCircleOutlined />
            </a-tooltip>
          </span>
        </template>
        <a-radio-group v-model:value="draft.namingMode" class="media-download-modes">
          <a-radio value="original">
            <strong>媒体库名称</strong>
            <span>采用当前资源名称，重名自动追加序号</span>
          </a-radio>
          <a-radio value="prefix">
            <strong>统一前缀 + 序号</strong>
            <span>例如：项目截图-01.png</span>
          </a-radio>
          <a-radio value="sequence">
            <strong>仅序号</strong>
            <span>例如：01.png、02.docx</span>
          </a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item v-if="draft.namingMode === 'prefix'" label="文件名前缀" required>
        <a-input v-model:value="draft.prefix" :maxlength="80" show-count allow-clear placeholder="例如：项目截图" />
      </a-form-item>

      <a-form-item label="文件名预览">
        <div class="media-download-preview">
          <div v-for="(fileName, index) in previewNames" :key="`${index}-${fileName}`" class="media-download-preview__item">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <strong :title="fileName">{{ fileName }}</strong>
          </div>
          <div v-if="records.length > previewNames.length" class="media-download-preview__more">
            另有 {{ records.length - previewNames.length }} 个文件
          </div>
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import {
  buildMediaDownloadNames,
  createDefaultArchiveName
} from './mediaDownloadOptions'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  records: {
    type: Array,
    default: () => []
  },
  submitting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:open', 'submit'])
const draft = reactive({
  archiveName: '',
  namingMode: 'original',
  prefix: '媒体资源'
})

const previewNames = computed(() => buildMediaDownloadNames(props.records, draft).slice(0, 5))
const canSubmit = computed(() => (
  props.records.length > 0 &&
  String(draft.archiveName || '').trim() &&
  (draft.namingMode !== 'prefix' || String(draft.prefix || '').trim())
))

watch(
  () => props.open,
  (visible) => {
    if (!visible) return
    draft.archiveName = createDefaultArchiveName()
    draft.namingMode = 'original'
    draft.prefix = '媒体资源'
  },
  { immediate: true }
)

function handleSubmit() {
  if (!canSubmit.value) return
  emit('submit', { ...draft })
}
</script>

<style scoped>
.media-download-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.media-download-modes {
  display: grid;
  gap: 8px;
  width: 100%;
}

.media-download-modes :deep(.ant-radio-wrapper) {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  margin: 0;
  padding: 10px 12px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
}

.media-download-modes :deep(.ant-radio-wrapper-checked) {
  border-color: var(--console-primary);
  background: var(--console-primary-soft);
}

.media-download-modes :deep(.ant-radio + span) {
  display: grid;
  gap: 2px;
}

.media-download-modes strong {
  color: var(--console-text);
  font-weight: 600;
}

.media-download-modes span,
.media-download-preview__more {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.media-download-preview {
  max-height: 190px;
  overflow-y: auto;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface-muted);
}

.media-download-preview__item {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  align-items: center;
  min-height: 36px;
  padding: 0 12px;
  border-bottom: 1px solid var(--console-border);
}

.media-download-preview__item > span {
  color: var(--console-text-secondary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.media-download-preview__item strong {
  overflow: hidden;
  color: var(--console-text);
  font-size: 13px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-download-preview__more {
  padding: 9px 12px;
  text-align: center;
}
</style>
