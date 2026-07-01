<template>
  <a-modal
    :open="open"
    title="移动书签"
    :width="520"
    :confirm-loading="submitting"
    ok-text="移动"
    cancel-text="取消"
    :destroy-on-close="true"
    :body-style="{ maxHeight: '64vh', overflowY: 'auto' }"
    @ok="submit"
    @cancel="$emit('update:open', false)"
  >
    <a-form layout="vertical">
      <a-form-item label="目标位置" required>
        <a-select
          v-model:value="targetFolderId"
          show-search
          option-filter-prop="label"
          :options="folderOptions"
          placeholder="选择目标文件夹"
        />
      </a-form-item>
      <a-alert
        type="info"
        show-icon
        :message="`将移动 ${count} 条书签到所选位置。`"
      />
    </a-form>
  </a-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  folders: { type: Array, default: () => [] },
  count: { type: Number, default: 0 },
  submitting: { type: Boolean, default: false }
})

const emit = defineEmits(['update:open', 'submit'])
const targetFolderId = ref('toolbar')

const folderOptions = computed(() => [
  { label: '书签栏', value: 'toolbar' },
  ...props.folders.map((folder) => ({
    label: `${'　'.repeat(folder.level || 0)}${folder.name}`,
    value: folder.id
  }))
])

watch(
  () => props.open,
  (visible) => {
    if (visible) targetFolderId.value = 'toolbar'
  }
)

function submit() {
  if (!targetFolderId.value) {
    message.warning('请选择目标位置')
    return
  }
  emit('submit', targetFolderId.value === 'toolbar' ? null : targetFolderId.value)
}
</script>
