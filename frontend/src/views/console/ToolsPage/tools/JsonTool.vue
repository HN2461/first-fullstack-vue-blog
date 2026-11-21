<template>
  <DeveloperToolWorkspace
    ref="workspace"
    v-model:input="input"
    :output="output"
    input-label="输入 JSON"
    output-label="JSON 处理结果"
    input-placeholder="粘贴 JSON，或从顶部载入示例、本地文件"
    output-placeholder="处理结果显示在右侧，可查找、折叠、复制和下载"
    :input-language="operation === 'escape' ? 'text' : 'json'"
    :output-language="outputLanguage"
    :indent="indent"
    :wrap="wrap"
    :result-only="resultOnly"
    :sync-scroll="syncScroll"
    :error="error"
    :diagnostic="diagnostic"
    :status="status"
    @error="error = $event"
    @execute="run"
  >
    <template #toolbar>
      <a-select v-model:value="operation" :options="operationOptions" show-search option-filter-prop="label" size="small" class="json-operation" aria-label="JSON 操作" />
      <a-select v-if="supportsIndent" v-model:value="indent" :options="indentOptions" show-search option-filter-prop="label" size="small" class="json-indent" aria-label="JSON 缩进" />
      <a-checkbox v-if="operation === 'sort'" v-model:checked="recursive">递归排序</a-checkbox>
      <a-input v-if="operation === 'extract'" v-model:value="pointer" class="json-pointer" size="small" allow-clear placeholder="JSON Pointer，例如 /items/0" aria-label="提取节点的 JSON Pointer" @press-enter="run" />
      <div class="json-actions">
        <a-popconfirm v-if="input" title="使用示例替换当前输入？" @confirm="loadExample">
          <a-tooltip title="载入示例"><a-button type="text" size="small" aria-label="载入 JSON 示例"><template #icon><FileCode2 :size="16" /></template></a-button></a-tooltip>
        </a-popconfirm>
        <a-tooltip v-else title="载入示例"><a-button type="text" size="small" aria-label="载入 JSON 示例" @click="loadExample"><template #icon><FileCode2 :size="16" /></template></a-button></a-tooltip>
        <a-popconfirm v-if="input" title="导入文件将替换当前输入，是否继续？" @confirm="fileInput?.click()">
          <a-tooltip title="导入 UTF-8 JSON 文件，最多 2 MiB"><a-button type="text" size="small" aria-label="导入 JSON 文件"><template #icon><FileInput :size="16" /></template></a-button></a-tooltip>
        </a-popconfirm>
        <a-tooltip v-else title="导入 UTF-8 JSON 文件，最多 2 MiB"><a-button type="text" size="small" aria-label="导入 JSON 文件" @click="fileInput?.click()"><template #icon><FileInput :size="16" /></template></a-button></a-tooltip>
        <a-popconfirm title="清空输入和结果？" @confirm="clear">
          <a-tooltip title="清空输入和结果"><a-button type="text" size="small" :disabled="!input && !output" aria-label="清空 JSON 输入和结果"><template #icon><Trash2 :size="16" /></template></a-button></a-tooltip>
        </a-popconfirm>
        <a-popconfirm title="使用结果替换输入？可通过撤销恢复。" @confirm="useResult">
          <a-tooltip title="将结果作为输入继续处理"><a-button type="text" size="small" :disabled="!validResult || !output" aria-label="将 JSON 结果作为输入"><template #icon><ArrowLeftRight :size="16" /></template></a-button></a-tooltip>
        </a-popconfirm>
        <a-button v-if="loading" size="small" danger @click="cancelRun">取消</a-button>
        <a-button size="small" type="primary" :loading="loading" @click="run">{{ currentAction }}</a-button>
        <a-button size="small" :disabled="!validResult || !output" @click="copyToolResult(output)">复制结果</a-button>
        <a-tooltip title="下载处理结果"><a-button type="text" size="small" :disabled="!validResult" aria-label="下载 JSON 结果" @click="download"><template #icon><Download :size="16" /></template></a-button></a-tooltip>
        <DeveloperEditorOptions v-model:wrap="wrap" v-model:sync-scroll="syncScroll" v-model:result-only="resultOnly" :foldable="outputLanguage === 'json'" @command="editorCommand" />
      </div>
      <input ref="fileInput" type="file" class="json-file-input" accept=".json,.txt,application/json,text/plain" @change="importFile" />
    </template>
  </DeveloperToolWorkspace>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onDeactivated, ref, watch } from 'vue'
import { ArrowLeftRight, Download, FileCode2, FileInput, Trash2 } from '@lucide/vue'
import DeveloperToolWorkspace from '../components/DeveloperToolWorkspace.vue'
import DeveloperEditorOptions from '../components/DeveloperEditorOptions.vue'
import { MAX_JSON_LENGTH } from '../logic/json'
import { copyToolResult } from '../utils/copyToolResult'
import { downloadToolResult, readLocalToolText } from '../utils/localToolFiles'
import { useDeveloperTask } from '../utils/useDeveloperTask'

const operationOptions = [
  { value: 'format', label: '格式化' }, { value: 'minify', label: '压缩' }, { value: 'validate', label: '校验' },
  { value: 'sort', label: '按键名排序' }, { value: 'escape', label: '字符串转义' }, { value: 'unescape', label: '字符串去转义' },
  { value: 'unicode-encode', label: 'Unicode 转义' }, { value: 'unicode-decode', label: 'Unicode 还原' }, { value: 'extract', label: '提取节点（Pointer）' }
]
const indentOptions = [{ value: '2', label: '2 空格' }, { value: '4', label: '4 空格' }, { value: 'tab', label: 'Tab 缩进' }]
const example = '{"name":"工具箱","requestId":9007199254740993,"enabled":true,"items":[{"id":1,"text":"你好😀"}]}'
const workspace = ref(null)
const fileInput = ref(null)
const input = ref('')
const output = ref('')
const operation = ref('format')
const indent = ref('2')
const pointer = ref('')
const recursive = ref(true)
const wrap = ref(true)
const resultOnly = ref(false)
const syncScroll = ref(false)
const error = ref('')
const diagnostic = ref(null)
const notice = ref('')
const outputLanguage = ref('json')
const processedSource = ref(null)
const task = useDeveloperTask()
const { loading } = task
let generation = 0
let importGeneration = 0
onDeactivated(() => { importGeneration += 1 })
onBeforeUnmount(() => { importGeneration += 1 })

const sourceKey = computed(() => JSON.stringify([input.value, operation.value, indent.value, recursive.value, pointer.value]))
const stale = computed(() => processedSource.value !== null && processedSource.value !== sourceKey.value)
const validResult = computed(() => processedSource.value === sourceKey.value && !error.value && !loading.value)
const currentAction = computed(() => operationOptions.find((item) => item.value === operation.value)?.label || '处理')
const supportsIndent = computed(() => !['minify', 'validate', 'escape', 'unescape'].includes(operation.value))
const status = computed(() => loading.value ? '正在本地处理，可取消' : stale.value ? '输入或参数已修改，请重新处理后使用结果' : notice.value)

watch(sourceKey, () => {
  error.value = ''
  diagnostic.value = null
  if (loading.value) {
    generation += 1
    task.cancel()
    notice.value = '输入或参数已修改，旧任务已停止'
  }
}, { flush: 'sync' })

async function run() {
  if (loading.value) return
  const version = ++generation
  const snapshot = sourceKey.value
  error.value = ''
  diagnostic.value = null
  notice.value = ''
  try {
    const result = await task.run('json', { input: input.value, operation: operation.value, indent: indent.value, recursive: recursive.value, pointer: pointer.value })
    if (version !== generation || snapshot !== sourceKey.value) return
    output.value = result.output
    outputLanguage.value = result.language
    processedSource.value = snapshot
    notice.value = `${result.message} · ${result.output.length.toLocaleString()} 字符`
  } catch (cause) {
    if (version !== generation || snapshot !== sourceKey.value) return
    if (cause.cancelled) {
      notice.value = '处理已取消'
      return
    }
    error.value = cause.message || 'JSON 处理失败'
    diagnostic.value = Number.isInteger(cause.offset) ? { offset: cause.offset, message: cause.message } : null
    resultOnly.value = false
    await nextTick()
    if (diagnostic.value) workspace.value?.inputEditor?.reveal(cause.offset)
  }
}

function cancelRun() {
  generation += 1
  task.cancel()
  notice.value = '处理已取消'
}

function clear() {
  cancelRun()
  importGeneration += 1
  input.value = ''
  output.value = ''
  error.value = ''
  diagnostic.value = null
  notice.value = ''
  processedSource.value = null
}

function loadExample() {
  input.value = operation.value === 'unescape' ? JSON.stringify(example) : operation.value === 'unicode-decode' ? '{"text":"\\u4f60\\u597d","id":9007199254740993}' : example
  if (operation.value === 'extract') pointer.value = '/items/0'
  resultOnly.value = false
}

async function importFile(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  const version = ++importGeneration
  const previousInput = input.value
  try {
    const text = await readLocalToolText(file)
    if (version !== importGeneration) return
    if (input.value !== previousInput) {
      error.value = '文件读取期间输入已改变，请重新导入以确认替换'
      return
    }
    input.value = text
    resultOnly.value = false
    notice.value = `已载入 ${file.name}`
  } catch (cause) {
    if (version === importGeneration) error.value = cause.message || '文件读取失败'
  }
}

function useResult() {
  if (!validResult.value) return
  if (output.value.length > MAX_JSON_LENGTH) {
    error.value = '结果超过 2 Mi 字符，无法直接作为输入，请下载后拆分'
    return
  }
  input.value = output.value
  resultOnly.value = false
}

function download() {
  if (!validResult.value) return
  downloadToolResult(output.value, outputLanguage.value === 'json' ? 'result.json' : 'result.txt', outputLanguage.value === 'json' ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8')
}

function editorCommand(command) {
  const editor = command.endsWith('output') ? workspace.value?.outputEditor : workspace.value?.inputEditor
  const method = { 'search-input': 'search', 'search-output': 'search', undo: 'undo', redo: 'redo', 'fold-output': 'foldAll', 'unfold-output': 'unfoldAll' }[command]
  if (method) editor?.[method]?.()
}
</script>

<style scoped>
.json-operation { width: 160px; }
.json-indent { width: 96px; }
.json-pointer { flex: 1; min-width: 160px; max-width: 260px; }
.json-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-left: auto; }
.json-file-input { display: none; }
</style>
