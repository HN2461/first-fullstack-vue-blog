<template>
  <a-modal
    :open="open"
    title="资源使用位置"
    :footer="null"
    centered
    width="min(760px, calc(100vw - 32px))"
    wrap-class-name="business-modal"
    :body-style="{ height: 'min(62vh, calc(100dvh - 180px))', overflow: 'hidden' }"
    @cancel="$emit('update:open', false)"
  >
    <MediaReferencePanel :open="open" :record="record" @navigate="$emit('update:open', false)" />
  </a-modal>
</template>

<script setup>
import MediaReferencePanel from './MediaReferencePanel.vue'
defineProps({ open: Boolean, record: { type: Object, default: null } })
defineEmits(['update:open'])
</script>
