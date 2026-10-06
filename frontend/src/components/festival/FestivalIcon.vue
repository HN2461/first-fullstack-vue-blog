<template>
  <img
    class="festival-icon"
    :src="iconSrc"
    alt=""
    aria-hidden="true"
    draggable="false"
  >
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: { type: String, required: true }
})

const iconSrc = computed(() => {
  const codepoints = [...props.icon]
    .map((character) => character.codePointAt(0).toString(16))
    .filter((codepoint) => codepoint !== 'fe0f')
    .join('-')

  return `/assets/festival-icons/${codepoints}.svg`
})
</script>

<style scoped>
.festival-icon {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
}
</style>
