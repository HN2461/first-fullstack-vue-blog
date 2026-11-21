<template>
  <section class="tool-panel stopwatch-tool">
    <div class="stopwatch-toolbar"><div class="stopwatch-actions"><a-button type="primary" size="small" @click="toggle">{{ running ? '暂停' : '开始' }}</a-button><a-button size="small" :disabled="!running || laps.length >= 200" @click="recordLap">分段</a-button><a-popconfirm title="重置计时并清空全部分段？" @confirm="reset"><a-button size="small" :disabled="!elapsed && !running">重置</a-button></a-popconfirm></div><a-button size="small" :disabled="!laps.length" @click="copyToolResult(lapText, '分段记录')">复制分段</a-button></div>
    <div class="stopwatch-display" aria-label="累计计时">{{ formatted }}</div>
    <div class="stopwatch-list-head"><span>分段记录</span><small>{{ laps.length }} / 200</small></div>
    <div class="stopwatch-laps">
      <div v-if="!laps.length" class="stopwatch-empty">运行时点击“分段”，记录每段与累计时长。</div>
      <div v-for="lap in [...laps].reverse()" :key="lap.index" class="stopwatch-lap"><span>#{{ lap.index }}</span><span>本段 {{ formatStopwatch(lap.segment) }}</span><span>累计 {{ formatStopwatch(lap.total) }}</span></div>
    </div>
    <div class="stopwatch-note">使用单调时钟计时，切换工具后继续运行；刷新、关闭或暂存被回收后结束。分段最多 200 条。</div>
  </section>
</template>
<script setup>
import { computed, onActivated, onBeforeUnmount, onDeactivated, ref } from 'vue'
import { formatStopwatch, stopwatchElapsed } from '../logic/dateTimeTools'
import { copyToolResult } from '../utils/copyToolResult'
const elapsed = ref(0)
const running = ref(false)
const laps = ref([])
let carried = 0
let startedAt = 0
let timer = 0
const formatted = computed(() => formatStopwatch(elapsed.value))
const lapText = computed(() => ['分段\t本段时长\t累计时长', ...laps.value.map((lap) => `${lap.index}\t${formatStopwatch(lap.segment)}\t${formatStopwatch(lap.total)}`)].join('\n'))
function tick() { if (running.value) elapsed.value = stopwatchElapsed(carried, startedAt, performance.now()) }
function stopTimer() {
  clearInterval(timer)
  timer = 0
}
function startTimer() {
  stopTimer()
  timer = window.setInterval(tick, 40)
}
function toggle() {
  if (running.value) {
    tick()
    carried = elapsed.value
    running.value = false
    stopTimer()
  } else {
    startedAt = performance.now()
    running.value = true
    tick()
    startTimer()
  }
}
function recordLap() {
  if (!running.value || laps.value.length >= 200) return
  tick()
  const previous = laps.value.at(-1)?.total || 0
  laps.value.push({ index: laps.value.length + 1, total: elapsed.value, segment: elapsed.value - previous })
}
function reset() {
  running.value = false
  stopTimer()
  elapsed.value = 0
  carried = 0
  laps.value = []
}
// 停止隐藏页面的刷新任务，重新激活时按同一起点补算，计时不依赖回调频率。
onDeactivated(stopTimer)
onActivated(() => {
  if (running.value) {
    tick()
    startTimer()
  }
})
onBeforeUnmount(stopTimer)
</script>
<style scoped>
.stopwatch-tool { display: flex; flex: 1; flex-direction: column; gap: 12px; min-height: 0; min-width: 0; overflow: hidden; }
.stopwatch-toolbar, .stopwatch-actions, .stopwatch-list-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; flex: 0 0 auto; }
.stopwatch-display { flex: 0 0 auto; padding: 14px 0; color: var(--console-text); font: 38px/1.4 'Cascadia Code', Consolas, monospace; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.stopwatch-list-head, .stopwatch-note { color: var(--console-text-secondary); font-size: 12px; }.stopwatch-laps { flex: 1; min-height: 0; overflow: auto; border: 1px solid var(--console-border); border-radius: 6px; }.stopwatch-empty { padding: 20px; color: var(--console-text-secondary); font-size: 12px; }.stopwatch-lap { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; padding: 12px; font: 13px/1.6 'Cascadia Code', Consolas, monospace; }.stopwatch-lap + .stopwatch-lap { border-top: 1px solid var(--console-border); }.stopwatch-note { flex: 0 0 auto; max-height: 42px; overflow: auto; }
</style>
