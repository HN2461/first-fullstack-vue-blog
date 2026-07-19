<template>
  <a-modal
    :open="open"
    :title="workspace?.id ? '编辑书签库' : '新建书签库'"
    :width="560"
    :confirm-loading="submitting"
    :body-style="{ maxHeight: '68vh', overflowY: 'auto' }"
    ok-text="保存"
    cancel-text="取消"
    @ok="submit"
    @cancel="$emit('update:open', false)"
  >
    <a-form layout="vertical">
      <a-form-item label="书签库名称" required>
        <a-input v-model:value.trim="form.name" :maxlength="80" placeholder="例如：Chrome 主库" />
      </a-form-item>
      <a-form-item label="浏览器类型" required>
        <a-select v-model:value="form.browserType" show-search option-filter-prop="label" :options="browserOptions" />
      </a-form-item>
      <a-form-item>
        <a-checkbox v-model:checked="form.isPrimary" :disabled="workspace?.isPrimary">
          {{ workspace?.isPrimary ? '当前主书签库' : '设为主书签库' }}
        </a-checkbox>
        <div class="workspace-form-tip">主书签库会作为对比主轴，并默认采用合并导入。</div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  workspace: { type: Object, default: null },
  submitting: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'submit'])
const form = reactive({ name: '', browserType: 'chrome', isPrimary: false })
const browserOptions = [
  { label: 'Google Chrome', value: 'chrome' },
  { label: 'Microsoft Edge', value: 'edge' },
  { label: 'Mozilla Firefox', value: 'firefox' },
  { label: 'Brave', value: 'brave' },
  { label: 'Opera', value: 'opera' },
  { label: 'Safari', value: 'safari' },
  { label: '其他浏览器或备份', value: 'other' }
]

watch(() => props.open, (visible) => {
  if (!visible) return
  form.name = props.workspace?.name || ''
  form.browserType = props.workspace?.browserType || 'chrome'
  form.isPrimary = Boolean(props.workspace?.isPrimary)
})

function submit() {
  if (!form.name) {
    message.warning('请输入书签库名称')
    return
  }
  emit('submit', { ...form })
}
</script>

<style scoped>
.workspace-form-tip {
  margin: 5px 0 0 24px;
  color: var(--console-text-secondary);
  font-size: 12px;
}
</style>
