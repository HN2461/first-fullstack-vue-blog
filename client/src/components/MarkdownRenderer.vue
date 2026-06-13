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
  }
})

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
})

const html = computed(() => markdown.render(props.content || ''))
</script>
