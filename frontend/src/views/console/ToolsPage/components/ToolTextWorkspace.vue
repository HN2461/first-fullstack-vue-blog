<template>
  <section class="tool-text-workspace">
    <div class="tool-text-workspace__toolbar">
      <div class="tool-text-workspace__options"><slot name="options" /></div>
      <div class="tool-text-workspace__actions">
        <small v-if="stale" class="tool-text-workspace__pending" role="status">待重新处理</small>
        <small v-else-if="hasRun && !currentError" class="tool-text-workspace__count" role="status">{{ output.length.toLocaleString() }} 字符</small>
        <a-popconfirm v-if="input" title="使用示例替换当前输入？" ok-text="替换" cancel-text="取消" @confirm="loadExample">
          <a-tooltip title="载入示例">
            <a-button size="small" type="text" class="tool-text-workspace__icon-button" aria-label="载入示例"><FileCode2 :size="15" /></a-button>
          </a-tooltip>
        </a-popconfirm>
        <a-tooltip v-else title="载入示例">
          <a-button size="small" type="text" class="tool-text-workspace__icon-button" aria-label="载入示例" @click="loadExample"><FileCode2 :size="15" /></a-button>
        </a-tooltip>
        <a-popconfirm title="清空当前输入和结果？" ok-text="清空" cancel-text="取消" @confirm="clear">
          <a-tooltip title="清空输入和结果">
            <a-button size="small" type="text" class="tool-text-workspace__icon-button" aria-label="清空输入和结果" :disabled="!input && !output"><Trash2 :size="15" /></a-button>
          </a-tooltip>
        </a-popconfirm>
        <a-button type="primary" size="small" @click="run">{{ runLabel }}</a-button>
        <a-button size="small" :disabled="!output || stale || Boolean(currentError)" @click="copyOutput">复制结果</a-button>
      </div>
    </div>
    <div class="tool-text-workspace__editors">
      <div class="tool-text-workspace__field">
        <a-textarea
          :value="input"
          :aria-label="inputLabel"
          :placeholder="inputPlaceholder"
          :status="currentError ? 'error' : undefined"
          :spellcheck="false"
          @update:value="emit('update:input', $event)"
        />
        <div v-if="currentError" class="tool-text-workspace__error" role="alert">{{ currentError }}</div>
      </div>
      <div class="tool-text-workspace__field">
        <a-textarea
          :value="output"
          :aria-label="outputLabel"
          placeholder="处理结果会显示在这里"
          :spellcheck="false"
          readonly
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { FileCode2, Trash2 } from '@lucide/vue'
import { copyToolResult } from '../utils/copyToolResult'

const props = defineProps({
  input: { type: String, default: '' },
  output: { type: String, default: '' },
  error: { type: String, default: '' },
  sourceKey: { type: [String, Number, Boolean], default: '' },
  example: { type: String, required: true },
  inputLabel: { type: String, default: '输入文本' },
  inputPlaceholder: { type: String, default: '粘贴或输入待处理文本' },
  outputLabel: { type: String, default: '处理结果' },
  runLabel: { type: String, default: '处理' }
})
const emit = defineEmits(['update:input', 'run', 'clear'])
const hasRun = ref(false)
const localError = ref('')
const processedInput = ref('')
const processedSourceKey = ref('')

// 保留上次结果供对照，但必须区分它与当前输入，避免复制已经过时的结果。
const stale = computed(() => hasRun.value && (
  props.input !== processedInput.value || props.sourceKey !== processedSourceKey.value
))
const currentError = computed(() => localError.value || (stale.value ? '' : props.error))
watch(() => [props.input, props.sourceKey], () => { localError.value = '' })

function run() {
  localError.value = ''
  if (props.input.length > 1024 * 1024) {
    localError.value = '本工具每次最多处理 1 Mi 字符，请拆分后处理；原输入未截断'
    return
  }
  processedInput.value = props.input
  processedSourceKey.value = props.sourceKey
  hasRun.value = true
  emit('run')
}

function clear() {
  localError.value = ''
  hasRun.value = false
  emit('update:input', '')
  emit('clear')
}

function loadExample() {
  localError.value = ''
  emit('update:input', props.example)
}

async function copyOutput() {
  if (!props.output || stale.value || currentError.value) return
  await copyToolResult(props.output)
}
</script>

<style scoped>
.tool-text-workspace {
  container-type: inline-size;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.tool-text-workspace__toolbar,
.tool-text-workspace__options,
.tool-text-workspace__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-text-workspace__toolbar { flex: 0 0 auto; flex-wrap: wrap; justify-content: space-between; min-height: 32px; }
.tool-text-workspace__options { flex-wrap: wrap; min-width: 0; }
.tool-text-workspace__actions { margin-left: auto; }
.tool-text-workspace__icon-button { display: inline-flex; align-items: center; justify-content: center; width: 24px; padding: 0; }
.tool-text-workspace__editors {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  /* 工具条固定，编辑区填满剩余空间；极低视口由编辑区滚动，避免裁断内容。 */
  grid-template-rows: minmax(140px, 1fr);
  flex: 1;
  gap: 12px;
  min-height: 0;
  overflow: auto;
}

.tool-text-workspace__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  min-height: 0;
}

.tool-text-workspace__count { color: var(--console-text-secondary); font-size: 12px; }
.tool-text-workspace__field :deep(textarea.ant-input) {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 48px;
  resize: none;
  font: 13px/1.65 'Cascadia Code', Consolas, monospace;
}

.tool-text-workspace__error {
  flex: 0 0 auto;
  max-height: 40px;
  overflow-y: auto;
  color: var(--ant-color-error, #ff4d4f);
  font-size: 12px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.tool-text-workspace__pending { color: var(--console-primary, #1677ff); }

@container (max-width: 680px) {
  .tool-text-workspace__editors {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: repeat(2, minmax(140px, 1fr));
  }
}

@media (max-width: 760px) {
  .tool-text-workspace__editors {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: repeat(2, minmax(140px, 1fr));
    gap: 8px;
  }
}
</style>
