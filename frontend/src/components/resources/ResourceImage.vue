<template>
  <img v-if="url" :src="url" :alt="alt" />
  <span v-else-if="error" class="resource-image-error" :title="error">图片暂不可用</span>
</template>

<script setup>
import { useResourceUrl } from '@/composables/useResourceUrl'

const props = defineProps({ src: { type: String, default: '' }, alt: { type: String, default: '' } })
const { url, error } = useResourceUrl(() => props.src)
</script>

<style scoped>
.resource-image-error { color: var(--console-text-secondary); font-size: 12px; }
</style>
