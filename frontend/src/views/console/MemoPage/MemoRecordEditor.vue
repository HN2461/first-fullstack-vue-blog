<template>
  <a-modal
    :open="open"
    :title="record?.id ? '编辑记录' : form.kind === 'reference' ? '添加资料' : '快速记录'"
    :width="720"
    :confirm-loading="saving"
    :body-style="{ maxHeight: '68vh', overflow: 'hidden' }"
    wrap-class-name="memo-editor-dialog"
    ok-text="保存"
    cancel-text="取消"
    destroy-on-close
    @update:open="$emit('update:open', $event)"
    @ok="submit"
  >
    <div class="memo-editor-scroll">
      <a-form layout="vertical">
        <a-form-item v-if="!record" label="记录方式">
          <a-segmented v-model:value="form.kind" :options="kindOptions" @change="switchKind" />
        </a-form-item>

        <template v-if="form.kind === 'capture'">
          <a-form-item label="标题">
            <a-input v-model:value.trim="form.title" :maxlength="80" placeholder="可留空，保存后按正文生成标题" />
          </a-form-item>
          <a-form-item label="记录内容" required>
            <a-textarea
              v-model:value="form.content"
              :auto-size="{ minRows: 6, maxRows: 14 }"
              :maxlength="5000"
              show-count
              placeholder="记录灵感、问题或稍后处理的线索"
              @keydown.ctrl.enter.prevent="submit"
              @keydown.meta.enter.prevent="submit"
            />
          </a-form-item>
          <div class="memo-editor-grid">
            <a-form-item label="记录类型">
              <a-select v-model:value="form.type" :options="typeOptions" show-search option-filter-prop="label" />
            </a-form-item>
            <a-form-item label="优先级">
              <a-select v-model:value="form.priority" :options="priorityOptions" show-search option-filter-prop="label" />
            </a-form-item>
            <a-form-item label="分类">
              <a-input v-model:value.trim="form.category" :maxlength="60" placeholder="如：项目改进、缺陷" />
            </a-form-item>
            <a-form-item label="计划日期">
              <a-input v-model:value.trim="form.dueAt" type="date" />
            </a-form-item>
            <a-form-item v-if="record" label="状态">
              <a-select v-model:value="form.status" :options="statusOptions" show-search option-filter-prop="label" />
            </a-form-item>
            <a-form-item label="标签">
              <a-input v-model:value="form.tagsText" :maxlength="160" placeholder="多个标签用逗号分隔" />
            </a-form-item>
          </div>
          <a-checkbox v-model:checked="form.isPinned">置顶这条记录</a-checkbox>
        </template>

        <template v-else>
          <div class="memo-editor-grid">
            <a-form-item label="资料名称" required>
              <a-input v-model:value.trim="form.title" :maxlength="80" placeholder="如：个人基本资料" />
            </a-form-item>
            <a-form-item label="分类">
              <a-input v-model:value.trim="form.category" :maxlength="60" placeholder="如：个人信息、证件" />
            </a-form-item>
          </div>
          <a-form-item v-if="!record" label="字段模板">
            <a-select
              :value="form.template"
              :options="templateOptions"
              show-search
              option-filter-prop="label"
              @change="changeTemplate"
            />
          </a-form-item>
          <div class="memo-fields-heading">
            <strong>资料字段</strong>
            <a-button size="small" @click="addField">
              <template #icon><Plus :size="14" /></template>
              添加字段
            </a-button>
          </div>
          <div class="memo-fields-list">
            <div v-for="(field, index) in form.fields" :key="field.key" class="memo-field-row">
              <a-input v-model:value.trim="field.label" class="memo-field-row__label" placeholder="字段名称" :maxlength="40" />
              <a-select v-model:value="field.type" class="memo-field-row__type" :options="fieldTypeOptions" show-search option-filter-prop="label" />
              <a-input
                v-if="!['textarea', 'address'].includes(field.type)"
                v-model:value="field.value"
                class="memo-field-row__value"
                :type="field.type === 'date' ? 'date' : 'text'"
                :maxlength="2000"
                :placeholder="field.preserveExisting ? '已有内容，留空保持不变' : '填写内容'"
                @input="markFieldChanged(field)"
              />
              <a-textarea
                v-else
                v-model:value="field.value"
                class="memo-field-row__value"
                :auto-size="{ minRows: 1, maxRows: 4 }"
                :maxlength="2000"
                :placeholder="field.preserveExisting ? '已有内容，留空保持不变' : '填写内容'"
                @input="markFieldChanged(field)"
              />
              <a-tooltip :title="field.isSensitive ? '敏感字段会加密保存' : '标记为敏感字段并加密保存'">
                <a-checkbox v-model:checked="field.isSensitive" class="memo-field-row__sensitive">敏感</a-checkbox>
              </a-tooltip>
              <a-tooltip title="移除字段">
                <a-button type="text" danger aria-label="移除字段" @click="removeField(index)">
                  <template #icon><Trash2 :size="15" /></template>
                </a-button>
              </a-tooltip>
            </div>
            <a-empty v-if="!form.fields.length" description="尚未添加资料字段" :image="false" />
          </div>
          <a-form-item label="标签">
            <a-input v-model:value="form.tagsText" :maxlength="160" placeholder="多个标签用逗号分隔" />
          </a-form-item>
        </template>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { Plus, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, default: false },
  record: { type: Object, default: null },
  initialKind: { type: String, default: 'capture' },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['update:open', 'save'])

const kindOptions = [
  { label: '收集箱速记', value: 'capture' },
  { label: '结构化资料', value: 'reference' }
]
const typeOptions = [
  { label: '灵感', value: 'idea' },
  { label: '计划', value: 'plan' },
  { label: '研究', value: 'study' },
  { label: '工作', value: 'work' }
]
const priorityOptions = [
  { label: '低优先级', value: 'low' },
  { label: '中优先级', value: 'medium' },
  { label: '高优先级', value: 'high' }
]
const statusOptions = [
  { label: '待处理', value: 'open' },
  { label: '已完成', value: 'completed' },
  { label: '已归档', value: 'archived' }
]
const fieldTypeOptions = [
  { label: '文本', value: 'text' },
  { label: '多行文本', value: 'textarea' },
  { label: '日期', value: 'date' },
  { label: '电话', value: 'phone' },
  { label: '证件号码', value: 'id-number' },
  { label: '地址', value: 'address' },
  { label: '邮箱', value: 'email' },
  { label: '数字', value: 'number' }
]
const templateOptions = [
  { label: '空白资料', value: 'blank' },
  { label: '个人基本资料', value: 'personal' }
]
const personalFields = [
  ['full-name', '姓名', 'text', false],
  ['english-name', '英文名', 'text', false],
  ['identity-number', '身份证', 'id-number', true],
  ['birthday', '生日', 'date', true],
  ['zodiac', '星座', 'text', false],
  ['ethnicity', '民族', 'text', false],
  ['political-status', '政治面貌', 'text', false],
  ['marital-status', '婚姻状况', 'text', false],
  ['native-place', '籍贯', 'text', true],
  ['household-registration', '户口所在地', 'address', true],
  ['household-type', '户口性质', 'text', true],
  ['archive-agency', '档案存放机构', 'text', true],
  ['phone', '手机号', 'phone', true],
  ['current-address', '现住址', 'address', true],
  ['current-postcode', '现住址邮编', 'text', false],
  ['hometown-address', '老家地址', 'address', true],
  ['hometown-postcode', '老家邮编', 'text', false]
]

const form = reactive({
  kind: 'capture',
  title: '',
  content: '',
  category: '',
  type: 'idea',
  status: 'open',
  priority: 'medium',
  dueAt: '',
  tagsText: '',
  isPinned: false,
  template: 'personal',
  fields: []
})

function newField(label = '', type = 'text', isSensitive = false, key = '') {
  return {
    key: key || `field-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    type,
    value: '',
    isSensitive,
    preserveExisting: false
  }
}

function applyTemplate(template) {
  form.template = template
  form.fields = template === 'personal'
    ? personalFields.map(([key, label, type, isSensitive]) => newField(label, type, isSensitive, key))
    : []
}

function resetForm(record) {
  form.kind = record?.kind || props.initialKind
  form.title = record?.title || ''
  form.content = record?.content || ''
  form.category = record?.category || ''
  form.type = record?.type || 'idea'
  form.status = record?.status || 'open'
  form.priority = record?.priority || 'medium'
  form.dueAt = record?.dueAt ? new Date(record.dueAt).toISOString().slice(0, 10) : ''
  form.tagsText = (record?.tags || []).join('，')
  form.isPinned = record?.isPinned === true
  form.template = record || form.kind !== 'reference' ? 'blank' : 'personal'
  form.fields = record?.kind === 'reference'
    ? (record.fields || []).map((field) => ({
      ...field,
      value: field.value || '',
      preserveExisting: field.isSensitive === true && field.hasValue === true
    }))
    : []
  if (!record && form.kind === 'reference') applyTemplate('personal')
}

watch(
  () => [props.open, props.record?.id],
  ([open]) => {
    if (open) resetForm(props.record)
  },
  { immediate: true }
)

function switchKind(kind) {
  if (props.record) return
  if (kind === 'reference') {
    form.content = ''
    form.title = ''
    applyTemplate('personal')
  } else {
    form.fields = []
    form.template = 'blank'
  }
}

function changeTemplate(template) {
  const hasValues = form.fields.some((field) => field.value.trim())
  if (!hasValues) {
    applyTemplate(template)
    return
  }

  Modal.confirm({
    title: '替换当前字段？',
    content: '切换模板会清除当前已填写的字段。',
    okText: '替换',
    cancelText: '取消',
    onOk: () => applyTemplate(template)
  })
}

function addField() {
  form.fields.push(newField())
}

function removeField(index) {
  form.fields.splice(index, 1)
}

function markFieldChanged(field) {
  field.preserveExisting = false
}

function parseTags(value) {
  return [...new Set(String(value || '').split(/[,，\s]+/).map((tag) => tag.trim()).filter(Boolean))].slice(0, 8)
}

function makePayload() {
  const payload = {
    kind: form.kind,
    title: form.title.trim(),
    category: form.category.trim(),
    tags: parseTags(form.tagsText),
    isPinned: form.isPinned
  }

  if (form.kind === 'capture') {
    return {
      ...payload,
      content: form.content.trim(),
      type: form.type,
      status: form.status,
      priority: form.priority,
      dueAt: form.dueAt || null
    }
  }

  if (!form.fields.length) {
    message.warning('请至少添加一个资料字段')
    return null
  }

  payload.fields = form.fields.map((field, index) => {
    const next = {
      key: field.key,
      label: field.label.trim(),
      type: field.type,
      isSensitive: field.isSensitive === true,
      order: index
    }
    if (!field.preserveExisting || !props.record) next.value = field.value
    return next
  })
  return payload
}

function submit() {
  const payload = makePayload()
  if (!payload) return
  if (form.kind === 'capture' && !payload.content) {
    message.warning('请输入记录内容')
    return
  }
  if (form.kind === 'reference' && !payload.title) {
    message.warning('请输入资料名称')
    return
  }
  if (form.fields.some((field) => !field.label.trim())) {
    message.warning('请填写每个字段的名称')
    return
  }
  emit('save', payload)
}
</script>

<style scoped>
.memo-editor-scroll {
  max-height: min(62vh, 560px);
  overflow-y: auto;
  padding: 2px 6px 8px 0;
}

.memo-editor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 14px;
}

.memo-fields-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 0 10px;
  border-bottom: 1px solid var(--console-border);
}

.memo-fields-heading strong {
  color: var(--console-text);
  font-size: 13px;
}

.memo-fields-list {
  display: grid;
  max-height: 34vh;
  gap: 8px;
  overflow-y: auto;
  padding: 10px 2px 10px 0;
  margin-bottom: 14px;
}

.memo-field-row {
  display: grid;
  grid-template-columns: minmax(110px, 0.9fr) 132px minmax(160px, 1.4fr) 64px 32px;
  align-items: start;
  gap: 8px;
}

.memo-field-row__sensitive {
  padding-top: 6px;
  white-space: nowrap;
}

:global(.memo-editor-dialog .ant-modal) {
  top: 24px;
  padding-bottom: 48px;
}

@media (max-width: 720px) {
  .memo-editor-grid {
    grid-template-columns: 1fr;
  }

  .memo-field-row {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 32px;
    border-bottom: 1px solid var(--console-border);
    padding-bottom: 8px;
  }

  .memo-field-row__value {
    grid-column: 1 / 3;
    grid-row: 2;
  }

  .memo-field-row__sensitive {
    grid-column: 1 / 3;
    grid-row: 3;
    padding-top: 0;
  }

  .memo-field-row > :last-child {
    grid-column: 3;
    grid-row: 1;
  }

  :global(.memo-editor-dialog .ant-modal) {
    top: 12px;
    padding-bottom: 32px;
  }
}
</style>
