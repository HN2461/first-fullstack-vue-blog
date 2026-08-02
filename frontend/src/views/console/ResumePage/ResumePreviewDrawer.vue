<template>
  <a-drawer
    :open="open"
    title="Boss 投递简历预览"
    width="960"
    class="resume-preview-drawer"
    @close="$emit('update:open', false)"
  >
    <div class="resume-preview-shell">
      <BossResumeSheet
        :resume="resume"
        :show-section-actions="showSectionActions"
        @edit-section="handleEdit"
      />
    </div>
  </a-drawer>
</template>

<script setup>
import BossResumeSheet from './BossResumeSheet.vue'
import './resumePreview.css'

defineProps({
  open: { type: Boolean, default: false },
  resume: { type: Object, default: () => ({}) },
  showSectionActions: { type: Boolean, default: true }
})

const emit = defineEmits(['update:open', 'edit-section'])

function handleEdit(sectionKey) {
  emit('update:open', false)
  emit('edit-section', sectionKey)
}
</script>
