<template>
  <div class="media-markdown-preview">
    <MarkdownRenderer
      :content="normalizedContent"
      :asset-base="assetBase"
      :code-wrap="false"
      :expand-code-blocks="true"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  assetBase: {
    type: String,
    default: ''
  }
})

const normalizedContent = computed(() => stripFrontMatter(props.content))

function stripFrontMatter(value) {
  const source = String(value || '')
  const match = source.match(/^\uFEFF?\s*---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/)
  if (!match || !/(?:^|\r?\n)(?:title|summary|description|category|tags|slug|originalId|exportedAt)\s*:/m.test(match[1])) {
    return source
  }

  // Front Matter is export metadata, not part of the Markdown reading content.
  return source.slice(match[0].length)
}
</script>

<style scoped>
.media-markdown-preview {
  width: 100%;
  min-height: 100%;
  padding: 24px 28px 40px;
  overflow: auto;
  background: var(--console-surface);
  --text-primary: var(--console-text);
  --text-secondary: var(--console-text-secondary);
  --border-color: var(--console-border);
  --primary-color: var(--console-primary-strong);
  --bg-elevated: var(--console-surface);
  --bg-secondary: var(--console-surface-muted);
  --bg-muted: var(--console-surface-muted);
}

.media-markdown-preview :deep(.markdown-renderer) {
  max-width: 920px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .media-markdown-preview {
    padding: 18px 16px 30px;
  }
}
</style>
