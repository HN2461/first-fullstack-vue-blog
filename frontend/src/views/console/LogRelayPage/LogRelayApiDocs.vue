<template>
  <a-modal v-model:open="open" title="日志上传接口说明" :width="760" :footer="null" destroy-on-close>
    <div class="log-relay-docs">
      <a-alert
        v-if="usingPlaceholder"
        type="warning"
        show-icon
        message="当前未配置正式接口域名"
        description="正式部署时设置 VITE_LOG_RELAY_API_BASE_URL，文档会自动替换为服务器地址。"
      />
      <div class="log-relay-docs__summary">
        <div><span>上传地址</span><code>{{ uploadUrl }}</code></div>
        <div><span>请求方式</span><code>POST</code></div>
        <div><span>请求头</span><code>Content-Type: text/plain; charset=utf-8</code></div>
        <p>请求体直接放原始日志文本，不需要登录，不需要 JSON 包装。</p>
      </div>

      <div v-for="snippet in snippets" :key="snippet.title" class="log-relay-snippet">
        <div class="log-relay-snippet__head">
          <span><component :is="snippet.icon" :size="14" />{{ snippet.title }}</span>
          <a-tooltip title="复制示例">
            <a-button type="text" size="small" @click="copyText(snippet.code)">
              <template #icon><Copy :size="14" /></template>
            </a-button>
          </a-tooltip>
        </div>
        <pre>{{ snippet.code }}</pre>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed } from 'vue'
import { message } from 'ant-design-vue'
import { Code2, Copy, Smartphone, Terminal } from 'lucide-vue-next'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:open'])

const open = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const configuredBase = String(
  import.meta.env.VITE_LOG_RELAY_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || ''
).replace(/\/$/, '')
const currentHost = window.location.hostname
const usingPlaceholder = !configuredBase && ['localhost', '127.0.0.1', '::1'].includes(currentHost)
const uploadUrl = computed(() => {
  if (configuredBase) return `${configuredBase}/api/log-relay`
  if (usingPlaceholder) return 'https://your-server.example/api/log-relay'
  return `${window.location.origin}/api/log-relay`
})

const snippets = computed(() => [
  {
    title: 'cURL',
    icon: Terminal,
    code: [
      `curl -X POST "${uploadUrl.value}" \\`,
      '  -H "Content-Type: text/plain; charset=utf-8" \\',
      '  --data-binary @device.log'
    ].join('\n')
  },
  {
    title: 'JavaScript fetch',
    icon: Code2,
    code: `await fetch('${uploadUrl.value}', {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  body: logText
})`
  },
  {
    title: 'Android Kotlin + OkHttp',
    icon: Smartphone,
    code: `val request = Request.Builder()
    .url("${uploadUrl.value}")
    .post(logText.toRequestBody("text/plain; charset=utf-8".toMediaType()))
    .build()
client.newCall(request).enqueue(callback)`
  }
])

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value)
    message.success('接口示例已复制')
  } catch {
    message.error('复制失败，请检查浏览器剪贴板权限')
  }
}
</script>

<style scoped>
.log-relay-docs {
  max-height: min(70vh, 680px);
  overflow-y: auto;
  padding-right: 2px;
}

.log-relay-docs__summary {
  display: grid;
  gap: 8px;
  margin: 16px 0;
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 1.7;
}

.log-relay-docs__summary div {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
}

.log-relay-docs__summary code {
  padding: 2px 5px;
  border-radius: 4px;
  background: var(--console-surface-muted);
  color: var(--console-text-primary);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  word-break: break-all;
}

.log-relay-docs__summary p {
  margin: 2px 0 0 82px;
}

.log-relay-snippet {
  overflow: hidden;
  margin-top: 12px;
  border: 1px solid var(--console-border);
  border-radius: 6px;
}

.log-relay-snippet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 6px 2px 10px;
  background: var(--console-surface-muted);
  color: var(--console-text-primary);
  font-size: 12px;
  font-weight: 600;
}

.log-relay-snippet__head span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.log-relay-snippet pre {
  overflow: auto;
  max-height: 180px;
  margin: 0;
  padding: 10px;
  background: var(--console-input-bg);
  color: var(--console-text-primary);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 11px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
