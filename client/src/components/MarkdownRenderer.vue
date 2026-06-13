<template>
  <div class="markdown-body" v-html="html"></div>
</template>

<script setup>
import MarkdownIt from 'markdown-it'
import { computed } from 'vue'

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

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
})

const defaultImageRule = markdown.renderer.rules.image

markdown.renderer.rules.image = (tokens, index, options, env, self) => {
  const token = tokens[index]
  const srcIndex = token.attrIndex('src')

  if (srcIndex >= 0 && env.assetBase) {
    const src = token.attrs[srcIndex][1]
    if (/^(?![a-z][a-z\d+.-]*:|\/|#)/i.test(src)) {
      const resolved = new URL(src, `${window.location.origin}${env.assetBase}/`).pathname
      token.attrs[srcIndex][1] = resolved
    }
  }

  return defaultImageRule
    ? defaultImageRule(tokens, index, options, env, self)
    : self.renderToken(tokens, index, options)
}

const html = computed(() => markdown.render(props.content || '', {
  assetBase: props.assetBase
}))
</script>
