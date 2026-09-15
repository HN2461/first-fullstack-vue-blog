<template>
  <section class="tool-panel stopwatch-tool">
    <div class="stopwatch-display">{{ formatted }}</div>
    <div class="stopwatch-actions"><a-button type="primary" @click="toggle">{{ running ? '暂停' : '开始' }}</a-button><a-button @click="reset">重置</a-button></div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
const elapsed = ref(0)
const running = ref(false)
let startedAt = 0
let timer = 0
const formatted = computed(() => {
  const total = elapsed.value
  const minutes = Math.floor(total / 60000).toString().padStart(2, '0')
  const seconds = Math.floor(total / 1000 % 60).toString().padStart(2, '0')
  const milliseconds = Math.floor(total % 1000 / 10).toString().padStart(2, '0')
  return `${minutes}:${seconds}.${milliseconds}`
})
function tick() { elapsed.value = Date.now() - startedAt }
function toggle() {
  if (running.value) {
    tick()
    running.value = false
    clearInterval(timer)
  } else {
    startedAt = Date.now() - elapsed.value
    running.value = true
    timer = window.setInterval(tick, 40)
  }
}

function reset() {
  running.value = false
  clearInterval(timer)
  elapsed.value = 0
}
onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.tool-panel { display: grid; gap: 18px; max-width: 600px; }.stopwatch-display { padding: 28px; border: 1px solid var(--console-border, #e5e7eb); border-radius: 8px; color: var(--console-primary, #1677ff); background: var(--console-surface-muted, #f8fafc); font: 48px/1.2 'Cascadia Code', Consolas, monospace; text-align: center; }.stopwatch-actions { display: flex; justify-content: center; gap: 8px; }
</style>
