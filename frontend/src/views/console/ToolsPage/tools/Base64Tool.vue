<template>
  <DeveloperToolWorkspace
    ref="workspace"
    v-model:input="input"
    :output="output"
    :input-label="mode === 'encode' ? '待编码的 UTF-8 文本' : '待解码的 Base64 文本'"
    :output-label="mode === 'encode' ? 'Base64 编码结果' : '解码结果或十六进制预览'"
    :input-placeholder="mode === 'encode' ? '输入 UTF-8 文本，或导入任意本地文件进行编码' : '输入 Base64、Base64url 或 base64 Data URL'"
    output-placeholder="转换结果会显示在这里"
    input-language="text"
    output-language="text"
    :wrap="wrap"
    :result-only="resultOnly"
    :sync-scroll="syncScroll"
    :error="error"
    :status="status"
    @error="handleEditorError"
    @execute="convert"
  >
    <template #toolbar>
      <a-radio-group v-model:value="mode" size="small" aria-label="Base64 操作">
        <a-radio-button value="encode">编码</a-radio-button>
        <a-radio-button value="decode">解码</a-radio-button>
      </a-radio-group>
      <a-select v-model:value="alphabet" :options="alphabetOptions" show-search option-filter-prop="label" size="small" aria-label="Base64 字母表" class="base64-tool__alphabet" />
      <a-popover placement="bottomLeft" trigger="click" title="Base64 设置">
        <template #content>
          <div class="base64-tool__settings">
            <template v-if="mode === 'encode'">
              <a-checkbox v-model:checked="padding" :disabled="asDataUrl">保留末尾 = 填充</a-checkbox>
              <a-tooltip title="Data URL 使用标准 Base64 字母表并保留填充">
                <a-checkbox v-model:checked="asDataUrl">输出为 Data URL</a-checkbox>
              </a-tooltip>
            </template>
            <template v-else>
              <a-tooltip title="仅忽略空格、Tab、换行等 ASCII 空白；其他非法字符仍会报错">
                <a-checkbox v-model:checked="ignoreWhitespace">忽略输入中的空白</a-checkbox>
              </a-tooltip>
              <label class="base64-tool__setting-row">
                <span>解码展示</span>
                <a-select v-model:value="outputFormat" :options="outputFormats" show-search option-filter-prop="label" size="small" aria-label="解码结果展示格式" />
              </label>
            </template>
            <div class="base64-tool__settings-divider" />
            <a-checkbox v-model:checked="wrap">编辑区自动换行</a-checkbox>
            <a-checkbox v-model:checked="resultOnly">仅查看结果</a-checkbox>
            <a-checkbox v-model:checked="syncScroll">同步滚动</a-checkbox>
          </div>
        </template>
        <a-tooltip title="设置字母表、输出格式和编辑区显示">
          <a-button size="small" type="text" class="base64-tool__icon" aria-label="Base64 设置"><Settings2 :size="16" /></a-button>
        </a-tooltip>
      </a-popover>
      <div class="base64-tool__actions">
        <a-popconfirm v-if="hasSource || encodingFile" title="使用示例替换当前输入？" ok-text="替换" cancel-text="取消" @confirm="loadExample">
          <a-tooltip title="载入当前模式的示例"><a-button size="small" type="text" class="base64-tool__icon" aria-label="载入示例"><FileCode2 :size="16" /></a-button></a-tooltip>
        </a-popconfirm>
        <a-tooltip v-else title="载入当前模式的示例"><a-button size="small" type="text" class="base64-tool__icon" aria-label="载入示例" @click="loadExample"><FileCode2 :size="16" /></a-button></a-tooltip>
        <a-popconfirm v-if="hasSource || encodingFile" title="导入文件替换当前输入？" ok-text="选择文件" cancel-text="取消" @confirm="chooseFile">
          <a-tooltip :title="importTitle"><a-button size="small" type="text" class="base64-tool__icon" :loading="importing" aria-label="导入本地文件"><FileUp :size="16" /></a-button></a-tooltip>
        </a-popconfirm>
        <a-tooltip v-else :title="importTitle"><a-button size="small" type="text" class="base64-tool__icon" :loading="importing" aria-label="导入本地文件" @click="chooseFile"><FileUp :size="16" /></a-button></a-tooltip>
        <a-popconfirm title="清空当前输入、文件和结果？" ok-text="清空" cancel-text="取消" @confirm="clear">
          <a-tooltip title="清空输入、文件和结果"><a-button size="small" type="text" class="base64-tool__icon" :disabled="!hasContent" aria-label="清空"><Trash2 :size="16" /></a-button></a-tooltip>
        </a-popconfirm>
        <a-tooltip title="用完整结果继续编解码，二进制按原始字节处理">
          <a-button size="small" type="text" class="base64-tool__icon" :disabled="!canUseResult" aria-label="用结果继续处理" @click="useResult"><ArrowLeftRight :size="16" /></a-button>
        </a-tooltip>
        <a-dropdown :trigger="['click']">
          <template #overlay>
            <a-menu @click="handleEditorCommand">
              <a-menu-item key="search-input" :disabled="hasEncodingFile || resultOnly">查找输入</a-menu-item>
              <a-menu-item key="search-output">查找结果</a-menu-item>
              <a-menu-item key="undo" :disabled="hasEncodingFile || resultOnly">撤销输入</a-menu-item>
              <a-menu-item key="redo" :disabled="hasEncodingFile || resultOnly">重做输入</a-menu-item>
            </a-menu>
          </template>
          <a-tooltip title="查找、撤销和重做"><a-button size="small" type="text" class="base64-tool__icon" aria-label="编辑操作"><Ellipsis :size="16" /></a-button></a-tooltip>
        </a-dropdown>
        <a-tooltip title="转换（Ctrl / Cmd + Enter）"><a-button type="primary" size="small" :loading="loading" :disabled="!hasSource || importing" @click="convert">转换</a-button></a-tooltip>
        <a-tooltip v-if="loading" title="取消当前处理"><a-button size="small" aria-label="取消当前处理" @click="cancelProcessing">取消</a-button></a-tooltip>
        <a-tooltip :title="result?.truncated ? '复制当前预览，完整原件请下载' : '复制当前结果文本'"><a-button size="small" :disabled="!canUseResult || !output" @click="copyOutput">复制</a-button></a-tooltip>
        <a-tooltip :title="mode === 'decode' ? '下载完整解码字节，不受预览截断影响' : '下载完整 Base64 文本'"><a-button size="small" type="text" class="base64-tool__icon" :disabled="!canUseResult" aria-label="下载结果" @click="downloadOutput"><Download :size="16" /></a-button></a-tooltip>
      </div>
      <input ref="fileInput" type="file" :accept="mode === 'decode' ? '.txt,.b64,.base64,text/plain' : undefined" class="base64-tool__file-input" @change="importFile" />
    </template>
    <template v-if="hasEncodingFile" #input>
      <div class="base64-tool__file-summary">
        <File :size="30" aria-hidden="true" />
        <strong>{{ encodingFile.name }}</strong>
        <span>{{ encodingFile.bytes.byteLength.toLocaleString() }} 字节 · {{ encodingFile.mimeType }}</span>
        <p>将按原始字节编码，文件保留在当前页面内存中。</p>
        <a-popconfirm title="移除当前文件，恢复原文本输入？" ok-text="移除文件" cancel-text="取消" @confirm="removeEncodingFile">
          <a-button size="small">移除文件，恢复文本输入</a-button>
        </a-popconfirm>
      </div>
    </template>
  </DeveloperToolWorkspace>
</template>

<script setup>
import { computed, onBeforeUnmount, onDeactivated, ref, shallowRef, watch } from 'vue'
import { message } from 'ant-design-vue'
import { ArrowLeftRight, Download, Ellipsis, File, FileCode2, FileUp, Settings2, Trash2 } from '@lucide/vue'
import DeveloperToolWorkspace from '../components/DeveloperToolWorkspace.vue'
import { MAX_BASE64_BYTES } from '../logic/base64'
import { copyToolResult } from '../utils/copyToolResult'
import { downloadToolResult, readLocalToolBytes, readLocalToolText } from '../utils/localToolFiles'
import { useDeveloperTask } from '../utils/useDeveloperTask'

const workspace = ref(null)
const fileInput = ref(null)
const mode = ref('encode')
const alphabet = ref('standard')
const padding = ref(true)
const ignoreWhitespace = ref(true)
const asDataUrl = ref(false)
const outputFormat = ref('auto')
const wrap = ref(true)
const resultOnly = ref(false)
const syncScroll = ref(false)
const input = ref('')
const output = ref('')
const error = ref('')
const notice = ref('')
const importing = ref(false)
const encodingFile = shallowRef(null)
const importedTextName = ref('')
const result = shallowRef(null)
const sourceVersion = ref(0)
const resultVersion = ref(-1)
const task = useDeveloperTask()
const { loading } = task
let requestSequence = 0
let importSequence = 0

const outputFormats = [{ value: 'auto', label: '自动：UTF-8 或十六进制' }, { value: 'text', label: '仅 UTF-8 文本' }, { value: 'hex', label: '十六进制预览' }]
const alphabetOptions = computed(() => [
  ...(mode.value === 'decode' ? [{ value: 'auto', label: '自动识别字母表' }] : []),
  { value: 'standard', label: '标准 Base64' },
  { value: 'url', label: 'URL-safe', disabled: mode.value === 'encode' && asDataUrl.value }
])
const hasEncodingFile = computed(() => mode.value === 'encode' && Boolean(encodingFile.value))
const hasSource = computed(() => hasEncodingFile.value || input.value.length > 0)
const hasContent = computed(() => Boolean(input.value || output.value || encodingFile.value || result.value || error.value || importing.value))
const stale = computed(() => Boolean(result.value) && resultVersion.value !== sourceVersion.value)
const canUseResult = computed(() => Boolean(result.value) && !stale.value && !loading.value && !importing.value && !error.value)
const importTitle = computed(() => mode.value === 'encode' ? '导入任意本地文件编码，最多 2 MiB，不上传' : '导入 UTF-8 Base64 文本，最多 3 MiB，不上传')
const status = computed(() => {
  if (loading.value) return '正在当前设备的独立线程中处理，可取消'
  if (importing.value) return '正在读取本地文件'
  if (notice.value) return stale.value ? `${notice.value}，旧结果已过期，请重新转换` : notice.value
  if (stale.value) return '输入或设置已变更，结果待重新转换'
  return result.value?.message || ''
})

// 编辑/设置变化会终止旧快照，结果仍可对照，但复制、下载和继续处理必须等重新转换。
watch([input, mode, alphabet, padding, ignoreWhitespace, asDataUrl, outputFormat, encodingFile], () => {
  sourceVersion.value += 1
  requestSequence += 1
  importSequence += 1
  task.cancel()
  importing.value = false
  error.value = ''
  notice.value = ''
}, { flush: 'sync' })
watch(mode, (operation) => { alphabet.value = operation === 'decode' ? 'auto' : 'standard' })
watch(asDataUrl, (enabled) => {
  if (!enabled) return
  alphabet.value = 'standard'
  padding.value = true
})

/**
 * 对当前输入建立独立处理快照，只有输入版本与请求序号仍匹配时才发布结果。
 * @returns {Promise<void>} 完成、失败或取消后结束；Worker 异常仅在当前请求仍有效时显示。
 */
async function convert() {
  if (!hasSource.value || importing.value) return
  const version = sourceVersion.value
  const request = ++requestSequence
  const operation = mode.value
  const file = hasEncodingFile.value ? encodingFile.value : null
  const options = {
    input: input.value, operation, alphabet: alphabet.value, padding: padding.value,
    ignoreWhitespace: ignoreWhitespace.value, asDataUrl: asDataUrl.value, outputFormat: outputFormat.value,
    ...(file ? { bytes: file.bytes, mimeType: file.mimeType } : {})
  }
  error.value = ''
  notice.value = ''
  try {
    const processed = await task.run('base64', options)
    if (request !== requestSequence || version !== sourceVersion.value) return
    result.value = { ...processed, operation, fileName: file?.name || importedTextName.value }
    output.value = processed.output
    resultVersion.value = version
  } catch (cause) {
    if (request !== requestSequence || version !== sourceVersion.value) return
    if (cause.cancelled) notice.value = '处理已取消'
    else error.value = cause.message || 'Base64 转换失败，请检查输入'
  }
}

function cancelProcessing() {
  task.cancel()
  notice.value = '处理已取消'
}

function handleEditorError(value) {
  task.cancel()
  error.value = value
}

function loadExample() {
  cancelImport()
  encodingFile.value = null
  importedTextName.value = ''
  input.value = mode.value === 'encode' ? '你好，工具箱！' : '5L2g5aW977yM5bel5YW3566x77yB'
  resultOnly.value = false
  error.value = ''
}

function clear() {
  cancelImport()
  requestSequence += 1
  task.cancel()
  input.value = ''
  encodingFile.value = null
  importedTextName.value = ''
  output.value = ''
  result.value = null
  error.value = ''
  notice.value = ''
  resultOnly.value = false
}

function chooseFile() {
  if (fileInput.value) fileInput.value.value = ''
  fileInput.value?.click()
}

/**
 * 读取用户选择的本地文件；编码保留字节，解码只接收有效 UTF-8 文本。
 * @param {Event} event 原生文件选择事件；取消选择不会修改现有输入。
 * @returns {Promise<void>} 仅在当前输入版本仍有效时应用读取结果，不上传或持久化文件。
 */
async function importFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  task.cancel()
  const request = ++importSequence
  const version = sourceVersion.value
  const operation = mode.value
  importing.value = true
  error.value = ''
  try {
    const limit = operation === 'encode' ? MAX_BASE64_BYTES : 3 * 1024 * 1024
    if (file.size > limit) throw new Error(`每次最多导入 ${operation === 'encode' ? 2 : 3} MiB 文件`)
    if (operation === 'encode') {
      const bytes = await readLocalToolBytes(file, limit)
      if (request !== importSequence || version !== sourceVersion.value) return
      encodingFile.value = { bytes, name: file.name || 'local-file.bin', mimeType: file.type || 'application/octet-stream' }
      importedTextName.value = ''
    } else {
      const text = await readLocalToolText(file, limit)
      if (request !== importSequence || version !== sourceVersion.value) return
      encodingFile.value = null
      input.value = text
      importedTextName.value = file.name || ''
    }
    resultOnly.value = false
  } catch (cause) {
    if (request === importSequence && version === sourceVersion.value) error.value = cause.message || '无法读取本地文件'
  } finally {
    if (request === importSequence) importing.value = false
    event.target.value = ''
  }
}

function cancelImport() {
  importSequence += 1
  importing.value = false
}

function removeEncodingFile() {
  encodingFile.value = null
  resultOnly.value = false
}

function useResult() {
  if (!canUseResult.value) return
  const current = result.value
  if (current.operation === 'encode') {
    encodingFile.value = null
    mode.value = 'decode'
    input.value = current.output
    importedTextName.value = current.fileName ? `${current.fileName}.b64` : ''
  } else {
    // 十六进制只是预览，继续处理必须使用完整原始字节，不能编码预览中的空格与十六进制字符。
    mode.value = 'encode'
    encodingFile.value = { bytes: current.bytes, name: decodedFilename(current), mimeType: current.mimeType || 'application/octet-stream' }
  }
  resultOnly.value = false
}

async function copyOutput() {
  if (!canUseResult.value || !output.value) return
  await copyToolResult(output.value, result.value.truncated ? '预览文本' : '结果')
}

function decodedFilename(current) {
  const suggested = current.fileName?.replace(/\.(?:b64|base64|txt)$/i, '')
  const extensions = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'application/pdf': 'pdf', 'text/plain': 'txt', 'application/json': 'json' }
  const extension = extensions[current.mimeType?.toLowerCase()] || (current.binary ? 'bin' : 'txt')
  return suggested && /\.[^./]+$/.test(suggested) ? suggested : `${suggested || 'base64-decoded'}.${extension}`
}

function downloadOutput() {
  if (!canUseResult.value) return
  const current = result.value
  try {
    if (current.operation === 'encode') downloadToolResult(current.output, `${current.fileName || 'base64-result'}.b64`, 'text/plain;charset=utf-8')
    else downloadToolResult(current.bytes, decodedFilename(current), current.mimeType || 'application/octet-stream')
    message.success('已交给浏览器下载')
  } catch {
    message.error('无法发起下载，请检查浏览器设置后重试')
  }
}

function handleEditorCommand({ key }) {
  const editor = key === 'search-output' ? workspace.value?.outputEditor : workspace.value?.inputEditor
  if (key.startsWith('search-')) editor?.search()
  else editor?.[key]?.()
}

onBeforeUnmount(cancelImport)
onDeactivated(cancelImport)
</script>

<style scoped>
.base64-tool__alphabet { width: 155px; }
.base64-tool__actions { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-left: auto; }
.base64-tool__icon { display: inline-flex; align-items: center; justify-content: center; width: 26px; padding: 0; }
.base64-tool__file-input { display: none; }
.base64-tool__settings { display: flex; flex-direction: column; gap: 12px; width: min(280px, calc(100vw - 64px)); max-height: min(420px, 65vh); overflow-y: auto; }
.base64-tool__settings :deep(.ant-checkbox-wrapper + .ant-checkbox-wrapper) { margin-inline-start: 0; }
.base64-tool__setting-row { display: grid; gap: 6px; color: var(--console-text-secondary); font-size: 12px; }
.base64-tool__settings-divider { border-top: 1px solid var(--console-border); }
.base64-tool__file-summary { display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; min-height: 0; gap: 12px; padding: 24px; overflow: auto; border: 1px solid var(--console-border-strong, var(--console-border)); border-radius: 6px; color: var(--console-text-secondary); background: var(--console-input-bg); text-align: center; }
.base64-tool__file-summary strong { max-width: 100%; color: var(--console-text); overflow-wrap: anywhere; }
.base64-tool__file-summary span, .base64-tool__file-summary p { margin: 0; font-size: 12px; line-height: 1.6; overflow-wrap: anywhere; }
@media (max-width: 760px) { .base64-tool__actions { gap: 4px; } }
</style>
