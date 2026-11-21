<template>
  <section class="tool-panel regex-tool">
    <div class="regex-controls">
      <label class="regex-field" for="tool-regex-pattern">
        <span>正则表达式</span>
        <a-input id="tool-regex-pattern" v-model:value="pattern" addon-before="/" addon-after="/" placeholder="输入表达式" spellcheck="false" @press-enter="run" />
      </label>
      <div class="regex-field">
        <div class="regex-flags-label">
          <label for="tool-regex-flags">标志</label>
          <a-tooltip title="g 全局匹配；i 忽略大小写；m 多行；s 点号包含换行；其他标志以当前浏览器支持为准。">
            <CircleHelp :size="13" tabindex="0" aria-label="正则标志说明" />
          </a-tooltip>
        </div>
        <a-input id="tool-regex-flags" v-model:value="flags" maxlength="8" placeholder="gim" spellcheck="false" @press-enter="run" />
      </div>
      <div class="regex-actions">
        <a-popconfirm title="清空表达式、测试文本和匹配结果？" @confirm="clear">
          <a-button size="small" :disabled="!pattern && !text && !hasRun">清空</a-button>
        </a-popconfirm>
        <a-button v-if="loading" size="small" @click="cancelCurrent">取消测试</a-button>
        <a-button type="primary" size="small" :loading="loading" @click="run">测试匹配</a-button>
        <a-button size="small" :disabled="!copySource || resultStale || loading || Boolean(currentError)" @click="copyToolResult(copySource, '匹配文本')">复制匹配</a-button>
      </div>
    </div>
    <div class="regex-workspace">
      <div class="regex-panel">
        <a-textarea id="tool-regex-text" v-model:value="text" aria-label="正则测试文本" spellcheck="false" placeholder="输入要匹配的文本，点击“测试匹配”执行；允许空文本" />
      </div>
      <section class="regex-panel" aria-label="匹配结果">
        <div class="regex-results-body">
          <a-alert v-if="currentError" type="error" show-icon :message="currentError" />
          <div v-else-if="matches.length" class="regex-matches">
            <article v-for="(match, index) in matches" :key="`${match.index}-${index}`" class="regex-match">
              <div class="regex-match-head"><strong>匹配 {{ index + 1 }}</strong><span>位置 {{ match.index }}</span></div>
              <code class="regex-match-value">{{ match.value || '（空匹配）' }}</code>
              <dl v-if="match.groups.length" class="regex-groups">
                <template v-for="(group, groupIndex) in match.groups" :key="groupIndex">
                  <dt>捕获组 {{ groupIndex + 1 }}</dt>
                  <dd><code>{{ group === undefined ? '（未参与匹配）' : group || '（空文本）' }}</code></dd>
                </template>
              </dl>
              <dl v-if="match.namedGroups" class="regex-groups">
                <template v-for="(value, name) in match.namedGroups" :key="name"><dt>具名组 {{ name }}</dt><dd><code>{{ value === undefined ? '（未参与匹配）' : value || '（空文本）' }}</code></dd></template>
              </dl>
            </article>
          </div>
          <div v-else class="regex-empty" role="status">
            <Search :size="28" aria-hidden="true" />
            <strong>{{ emptyTitle }}</strong>
            <p>{{ emptyDescription }}</p>
          </div>
        </div>
      </section>
    </div>
    <div class="regex-note" role="status">{{ statusText }}</div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onDeactivated, ref, watch } from 'vue'
import { CircleHelp, Search } from '@lucide/vue'
import { copyToolResult } from '../utils/copyToolResult'
import { MAX_REGEX_MATCHES } from '../logic/regex'
import { createRegexRunner } from '../logic/regexRunner'

const MAX_MATCHES = MAX_REGEX_MATCHES
const runner = createRegexRunner()
let generation = 0
const loading = ref(false)
const pattern = ref('')
const flags = ref('g')
const text = ref('')
const matches = ref([])
const error = ref('')
const hasRun = ref(false)
const completed = ref(false)
const cancelled = ref(false)
const processedSource = ref('')
const truncated = ref(false)
const sourceKey = computed(() => JSON.stringify([pattern.value, flags.value, text.value]))
const resultStale = computed(() => hasRun.value && sourceKey.value !== processedSource.value)
const currentError = computed(() => resultStale.value ? '' : error.value)
const copySource = computed(() => matches.value.map((item) => item.value).join('\n'))
const emptyTitle = computed(() => loading.value ? '正在测试' : cancelled.value ? '测试已取消' : !completed.value || resultStale.value ? '等待测试' : '没有匹配项')
const emptyDescription = computed(() => loading.value ? '测试在独立线程运行，可随时取消。' : cancelled.value ? '本次测试尚未完成，重新测试后查看匹配结果。' : !completed.value || resultStale.value ? '点击“测试匹配”，查看匹配文本和捕获组。' : '调整表达式、标志或测试文本后重新测试。')
const statusText = computed(() => loading.value ? '正在测试；超过 1 秒将自动终止。' : cancelled.value ? '测试已取消，尚未生成匹配结果。' : resultStale.value
  ? '输入或标志已修改，请重新测试后使用结果。'
  : truncated.value ? `仅展示前 ${MAX_MATCHES} 处匹配，后续结果未展开。` : `${completed.value && !currentError.value ? `共 ${matches.value.length} 处匹配。` : ''} JavaScript 正则；位置为从 0 开始的 UTF-16 索引；允许空表达式和空文本。`)

async function run(event) {
  if (event?.isComposing || event?.keyCode === 229) return
  cancelCurrent()
  const current = ++generation
  error.value = ''
  matches.value = []
  truncated.value = false
  hasRun.value = true
  completed.value = false
  cancelled.value = false
  processedSource.value = sourceKey.value
  loading.value = true
  try {
    const result = await runner.run({ pattern: pattern.value, flags: flags.value, text: text.value })
    if (current !== generation) return
    matches.value = result.matches
    truncated.value = result.truncated
    completed.value = true
  } catch (cause) {
    if (current !== generation || cause.name === 'AbortError') return
    error.value = cause.message
  } finally {
    if (current === generation) loading.value = false
  }
}

function clear() {
  cancelCurrent()
  pattern.value = ''
  flags.value = 'g'
  text.value = ''
  matches.value = []
  error.value = ''
  hasRun.value = false
  completed.value = false
  cancelled.value = false
  processedSource.value = ''
  truncated.value = false
}

function cancelCurrent() {
  // 只有完整返回的任务才能报告匹配数量，取消不等同于零匹配。
  if (loading.value) {
    cancelled.value = true
    completed.value = false
  }
  generation += 1
  runner.cancel()
  loading.value = false
}

watch(sourceKey, cancelCurrent, { flush: 'sync' })
onDeactivated(cancelCurrent)
onBeforeUnmount(cancelCurrent)
</script>

<style scoped>
.regex-tool { container-type: inline-size; display: flex; flex: 1; flex-direction: column; gap: 12px; min-width: 0; min-height: 0; overflow: hidden; }
.regex-controls { display: grid; grid-template-columns: minmax(0, 1fr) 140px auto; align-items: center; gap: 10px; flex: 0 0 auto; }
.regex-field { display: flex; align-items: center; gap: 7px; min-width: 0; color: var(--console-text-secondary); font-size: 12px; }
.regex-field > span, .regex-flags-label { flex: 0 0 auto; white-space: nowrap; }
.regex-flags-label { display: flex; align-items: center; gap: 5px; }
.regex-actions, .regex-result-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.regex-actions { padding-bottom: 4px; }
.regex-workspace { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: minmax(0, 1fr); gap: 12px; flex: 1; min-height: 0; }
.regex-panel { display: flex; flex-direction: column; gap: 8px; min-width: 0; min-height: 0; }
.regex-panel-head { display: flex; align-items: center; justify-content: space-between; flex: 0 0 auto; gap: 8px; min-height: 28px; color: var(--console-text-secondary); font-size: 12px; }
.regex-panel-head small { font-size: 11px; }
.regex-panel-head > span > small { margin-left: 5px; }
.regex-panel :deep(textarea) { flex: 1; height: 100%; min-height: 0; resize: none; font: 13px/1.65 'Cascadia Code', Consolas, monospace; }
.regex-results-body { display: flex; flex: 1; flex-direction: column; min-height: 0; overflow: auto; border: 1px solid var(--console-border); border-radius: 6px; }
.regex-matches { display: grid; gap: 10px; padding: 10px; }
.regex-match { min-width: 0; padding-bottom: 10px; border-bottom: 1px solid var(--console-border); }
.regex-match:last-child { padding-bottom: 0; border-bottom: 0; }
.regex-match-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; margin-bottom: 6px; color: var(--console-text-secondary); font-size: 12px; }
.regex-match-head strong { font-weight: 500; }
.regex-match-value { display: block; overflow-wrap: anywhere; color: var(--console-text); font: 13px/1.6 'Cascadia Code', Consolas, monospace; white-space: pre-wrap; }
.regex-groups { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 6px 10px; margin: 9px 0 0; font-size: 12px; }
.regex-groups dt { color: var(--console-text-secondary); }
.regex-groups dd { min-width: 0; margin: 0; overflow-wrap: anywhere; color: var(--console-text); }
.regex-groups code { white-space: pre-wrap; }
.regex-empty { display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; gap: 10px; min-height: 0; padding: 20px; color: var(--console-text-secondary); text-align: center; }
.regex-empty strong { color: var(--console-text); font-size: 14px; font-weight: 500; }
.regex-empty p { margin: 0; font-size: 12px; }
.regex-note { flex: 0 0 auto; max-height: 42px; overflow: auto; color: var(--console-text-secondary); font-size: 12px; }
@container (max-width: 680px) {
  .regex-controls { grid-template-columns: minmax(0, 1fr) 90px; }
  .regex-actions { grid-column: 1 / -1; justify-content: flex-end; padding-bottom: 0; }
  .regex-workspace { grid-template-columns: minmax(0, 1fr); grid-template-rows: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 760px) {
  .regex-controls { grid-template-columns: minmax(0, 1fr) 90px; }
  .regex-actions { grid-column: 1 / -1; justify-content: flex-end; padding-bottom: 0; }
  .regex-workspace { grid-template-columns: minmax(0, 1fr); grid-template-rows: repeat(2, minmax(0, 1fr)); gap: 8px; }
}
</style>
