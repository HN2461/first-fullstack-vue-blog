<template>
  <a-modal
    :open="open"
    title="编辑分享配置"
    width="620px"
    centered
    :confirm-loading="saving"
    :body-style="{ maxHeight: '68vh', overflow: 'hidden' }"
    ok-text="保存配置"
    @ok="save"
    @cancel="emit('update:open', false)"
  >
    <a-form class="share-edit-form" layout="vertical">
      <a-form-item label="资源包名称" required>
        <a-input v-model:value="form.name" :maxlength="80" show-count />
      </a-form-item>
      <a-form-item label="资源包说明">
        <a-textarea v-model:value="form.description" :maxlength="500" :rows="3" show-count />
      </a-form-item>
      <div class="share-edit-form__grid">
        <a-form-item label="有效期">
          <a-select v-model:value="form.expiryMode" :options="expiryOptions" />
        </a-form-item>
        <a-form-item v-if="form.expiryMode === 'custom'" label="失效时间">
          <a-date-picker v-model:value="form.expiresAt" show-time format="YYYY-MM-DD HH:mm" style="width: 100%" />
        </a-form-item>
        <a-form-item label="访问人数上限">
          <div class="share-edit-form__limit">
            <a-switch v-model:checked="form.limitEnabled" />
            <a-input-number
              v-if="form.limitEnabled"
              v-model:value="form.maxAccessCount"
              :min="Math.max(1, record?.accessCount || 1)"
              :max="100000"
              style="width: 150px"
            />
            <span v-else>不限制</span>
          </div>
        </a-form-item>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import { updateAdminMediaShare } from '@/services/admin'

const props = defineProps({
  open: { type: Boolean, default: false },
  record: { type: Object, default: null }
})
const emit = defineEmits(['update:open', 'saved'])
const saving = ref(false)
const form = reactive({
  name: '',
  description: '',
  expiryMode: 'never',
  expiresAt: null,
  limitEnabled: false,
  maxAccessCount: 100
})
const expiryOptions = [
  { label: '永久有效', value: 'never' },
  { label: '指定时间', value: 'custom' }
]

watch(() => props.open, (visible) => {
  if (!visible || !props.record) return
  Object.assign(form, {
    name: props.record.name,
    description: props.record.description || '',
    expiryMode: props.record.expiresAt ? 'custom' : 'never',
    expiresAt: props.record.expiresAt ? dayjs(props.record.expiresAt) : null,
    limitEnabled: props.record.maxAccessCount !== null,
    maxAccessCount: props.record.maxAccessCount || Math.max(100, props.record.accessCount || 1)
  })
})

async function save() {
  if (!form.name.trim()) return message.warning('请输入资源包名称')
  if (form.expiryMode === 'custom' && !form.expiresAt) return message.warning('请选择分享失效时间')
  if (form.expiresAt && form.expiresAt.isBefore(dayjs())) return message.warning('分享失效时间必须晚于当前时间')
  saving.value = true
  try {
    const result = await updateAdminMediaShare(props.record.id, {
      name: form.name.trim(),
      description: form.description.trim(),
      expiresAt: form.expiryMode === 'never' ? null : form.expiresAt.toISOString(),
      maxAccessCount: form.limitEnabled ? form.maxAccessCount : null
    })
    message.success('分享配置已更新')
    emit('update:open', false)
    emit('saved', result)
  } catch (error) {
    message.error(error.message || '分享配置更新失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.share-edit-form { max-height: 64vh; overflow-y: auto; padding-right: 2px; scrollbar-width: none; }
.share-edit-form::-webkit-scrollbar { display: none; }
.share-edit-form__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 16px; }
.share-edit-form__limit { display: flex; align-items: center; gap: 12px; min-height: 32px; }
.share-edit-form__limit span { color: var(--console-text-secondary); }
@media (max-width: 640px) { .share-edit-form__grid { grid-template-columns: 1fr; } }
</style>
