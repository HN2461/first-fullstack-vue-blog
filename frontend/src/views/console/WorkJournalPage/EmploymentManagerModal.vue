<template>
  <a-modal
    :open="open"
    title="工作经历"
    :width="820"
    :confirm-loading="saving"
    :body-style="{ maxHeight: '68vh', overflow: 'hidden' }"
    wrap-class-name="work-journal-dialog"
    ok-text="保存经历"
    cancel-text="关闭"
    :ok-button-props="{ disabled: !form.company.trim() || !form.position.trim() || !form.startedOn }"
    @ok="save"
    @cancel="close"
  >
    <div class="employment-manager">
      <div class="employment-manager__form">
        <div class="employment-manager__heading">
          <strong>{{ editingId ? '编辑经历' : '新增经历' }}</strong>
          <a-button v-if="editingId" size="small" @click="resetForm">新建</a-button>
        </div>
        <a-form layout="vertical">
          <div class="employment-manager__grid">
            <a-form-item label="公司名称" required>
              <a-input v-model:value.trim="form.company" :maxlength="120" placeholder="公司或组织名称" />
            </a-form-item>
            <a-form-item label="岗位名称" required>
              <a-input v-model:value.trim="form.position" :maxlength="120" placeholder="岗位或职务" />
            </a-form-item>
            <a-form-item label="部门">
              <a-input v-model:value.trim="form.department" :maxlength="120" placeholder="选填" />
            </a-form-item>
            <a-form-item label="入职日期" required>
              <a-input v-model:value="form.startedOn" type="date" />
            </a-form-item>
            <a-form-item label="离职日期">
              <a-input v-model:value="form.endedOn" type="date" />
            </a-form-item>
          </div>
          <a-form-item label="备注">
            <a-textarea v-model:value="form.note" :maxlength="1000" :auto-size="{ minRows: 2, maxRows: 4 }" />
          </a-form-item>
        </a-form>
      </div>

    <div v-if="showList" class="employment-manager__list">
        <div class="employment-manager__list-heading">已记录经历 <span>{{ employments.length }}</span></div>
        <div v-if="employments.length" class="employment-manager__rows">
          <div v-for="item in employments" :key="item.id" class="employment-manager__row">
            <div class="employment-manager__identity">
              <strong>{{ item.company }}</strong>
              <span>{{ item.position }}<template v-if="item.department"> · {{ item.department }}</template></span>
            </div>
            <div class="employment-manager__dates">{{ item.startedOn }} 至 {{ item.endedOn || '至今' }}</div>
            <a-tooltip title="编辑工作经历">
              <a-button type="text" size="small" aria-label="编辑工作经历" @click="edit(item)">
                <template #icon><PencilLine :size="15" /></template>
              </a-button>
            </a-tooltip>
            <a-popconfirm
              title="删除这段工作经历？"
              description="关联的日报、周报、月报和图片凭证都会一并永久删除。"
              ok-text="删除经历"
              cancel-text="取消"
              @confirm="remove(item)"
            >
              <a-tooltip title="删除工作经历及所有关联记录">
                <a-button type="text" size="small" danger :aria-label="`删除 ${item.company} 工作经历`" :loading="deletingId === item.id">
                  <template #icon><Trash2 :size="15" /></template>
                </a-button>
              </a-tooltip>
            </a-popconfirm>
          </div>
        </div>
        <a-empty v-else description="暂无工作经历" :image-style="{ height: '44px' }" />
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { PencilLine, Trash2 } from 'lucide-vue-next'
import { createEmployment, deleteEmployment, updateEmployment } from '@/services/workJournal'

const props = defineProps({
  open: { type: Boolean, default: false },
  employments: { type: Array, default: () => [] },
  initialEmployment: { type: Object, default: null },
  showList: { type: Boolean, default: true }
})
const emit = defineEmits(['update:open', 'saved'])
const saving = ref(false)
const deletingId = ref('')
const editingId = ref('')
const form = reactive(createEmptyForm())

function createEmptyForm() {
  return { company: '', department: '', position: '', startedOn: '', endedOn: '', note: '' }
}

function resetForm() {
  editingId.value = ''
  Object.assign(form, createEmptyForm())
}

function edit(item) {
  editingId.value = item.id
  Object.assign(form, {
    company: item.company,
    department: item.department || '',
    position: item.position,
    startedOn: item.startedOn,
    endedOn: item.endedOn || '',
    note: item.note || ''
  })
}

async function save() {
  if (!form.company.trim() || !form.position.trim() || !form.startedOn) return
  saving.value = true
  try {
    const payload = { ...form }
    if (editingId.value) await updateEmployment(editingId.value, payload)
    else await createEmployment(payload)
    message.success(editingId.value ? '工作经历已更新' : '工作经历已创建')
    resetForm()
    emit('saved')
    emit('update:open', false)
  } catch (error) {
    message.error(error.message || '保存工作经历失败')
  } finally {
    saving.value = false
  }
}

async function remove(item) {
  deletingId.value = item.id
  try {
    await deleteEmployment(item.id)
    if (editingId.value === item.id) resetForm()
    message.success('工作经历及其关联日报、汇总和凭证已删除')
    emit('saved')
  } catch (error) {
    message.error(error.message || '删除工作经历失败')
  } finally {
    deletingId.value = ''
  }
}

function close() {
  emit('update:open', false)
}

watch(() => props.open, (visible) => {
  if (!visible) return
  if (props.initialEmployment) edit(props.initialEmployment)
  else resetForm()
})
</script>

<style scoped>
.employment-manager {
  max-height: calc(68vh - 40px);
  overflow-y: auto;
  padding-right: 4px;
}

.employment-manager__form {
  padding-bottom: 4px;
}

.employment-manager__heading,
.employment-manager__list-heading,
.employment-manager__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.employment-manager__heading {
  margin-bottom: 14px;
  font-size: 14px;
}

.employment-manager__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 14px;
}

.employment-manager__list {
  border-top: 1px solid var(--console-border, #e5e7eb);
  padding-top: 14px;
}

.employment-manager__list-heading {
  margin-bottom: 6px;
  color: var(--console-text-secondary, #667085);
  font-size: 12px;
}

.employment-manager__list-heading span,
.employment-manager__dates,
.employment-manager__identity span {
  color: var(--console-text-secondary, #667085);
  font-size: 12px;
}

.employment-manager__row {
  min-height: 58px;
  border-bottom: 1px solid var(--console-border, #e5e7eb);
}

.employment-manager__identity {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.employment-manager__identity strong,
.employment-manager__identity span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .employment-manager__grid {
    grid-template-columns: 1fr;
  }

  .employment-manager__dates {
    max-width: 112px;
    text-align: right;
  }
}
</style>
