<template>
  <a-modal
    :open="open"
    title="媒体回收站"
    :footer="null"
    centered
    width="min(920px, calc(100vw - 32px))"
    wrap-class-name="business-modal"
    :body-style="{ height: 'min(65vh, calc(100dvh - 180px))', overflow: 'hidden' }"
    @cancel="$emit('update:open', false)"
  >
    <MediaTrashPanel v-if="open" @changed="$emit('changed')" />
  </a-modal>
</template>

<script setup>
import MediaTrashPanel from './MediaTrashPanel.vue'
defineProps({ open: Boolean })
defineEmits(['update:open', 'changed'])
</script>
