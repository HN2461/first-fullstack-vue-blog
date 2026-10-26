<template>
  <a-drawer
    :open="open"
    :width="560"
    :title="`补充资料 · ${employment?.company || ''}`"
    :body-style="{ maxHeight: 'calc(100vh - 112px)', overflow: 'hidden' }"
    class="work-material-drawer"
    @close="close"
  >
    <div class="work-material">
      <div class="work-material__context">
        <strong>{{ employment?.company || '工作经历' }}</strong>
        <span>{{ employment?.position || '' }}<template v-if="employment?.department"> · {{ employment.department }}</template></span>
      </div>
      <div class="work-material__toolbar">
        <a-input-search v-model:value="keyword" allow-clear placeholder="搜索资料名称、地址或内容" @search="loadMaterials" @change="handleKeywordChange" />
        <a-select v-model:value="type" class="work-material__type" :options="typeOptions" show-search option-filter-prop="label" allow-clear placeholder="全部类型" @change="loadMaterials" />
        <a-button type="primary" @click="openCreate">
          <template #icon><Plus :size="15" /></template>
          新增资料
        </a-button>
      </div>

      <div class="work-material__body">
        <a-spin :spinning="loading">
          <a-empty v-if="!loading && !materials.length" description="暂无补充资料" />
          <div v-else class="work-material__list">
            <div v-for="item in materials" :key="item.id" class="work-material__item">
              <div class="work-material__item-main">
                <div class="work-material__item-title">
                  <strong>{{ item.title }}</strong>
                  <PinIcon v-if="item.isPinned" :size="14" class="work-material__pin" />
                </div>
                <div class="work-material__item-meta">
                  <a-tag :color="typeColors[item.type]">{{ typeLabels[item.type] }}</a-tag>
                  <span>{{ materialSummary(item) }}</span>
                </div>
                <p v-if="item.note" class="work-material__item-note">{{ item.note }}</p>
              </div>
              <a-space size="small" class="work-material__actions">
                <a-tooltip title="查看资料">
                  <a-button type="text" size="small" aria-label="查看资料" @click="openView(item)"><template #icon><Eye :size="15" /></template></a-button>
                </a-tooltip>
                <a-tooltip title="编辑资料">
                  <a-button type="text" size="small" aria-label="编辑资料" @click="openEdit(item)"><template #icon><PencilLine :size="15" /></template></a-button>
                </a-tooltip>
                <a-popconfirm title="删除这条补充资料？" ok-text="删除" cancel-text="取消" @confirm="remove(item)">
                  <a-tooltip title="删除资料">
                    <a-button type="text" size="small" danger aria-label="删除资料" :loading="deletingId === item.id"><template #icon><Trash2 :size="15" /></template></a-button>
                  </a-tooltip>
                </a-popconfirm>
              </a-space>
            </div>
          </div>
        </a-spin>
      </div>
    </div>
  </a-drawer>

  <a-modal
    v-model:open="editorOpen"
    :title="editingId ? '编辑补充资料' : '新增补充资料'"
    :width="620"
    :confirm-loading="saving"
    :body-style="{ maxHeight: '68vh', overflowY: 'auto' }"
    wrap-class-name="work-journal-dialog"
    ok-text="保存资料"
    cancel-text="取消"
    :ok-button-props="{ disabled: !form.title.trim() || !form.type }"
    @ok="save"
  >
    <a-form layout="vertical">
      <div class="work-material__form-grid">
        <a-form-item label="资料名称" required>
          <a-input v-model:value.trim="form.title" :maxlength="160" placeholder="例如：公司官网、测试环境账号" />
        </a-form-item>
        <a-form-item label="资料类型" required>
          <a-select v-model:value="form.type" :options="typeOptions" show-search option-filter-prop="label" placeholder="选择资料类型" />
        </a-form-item>
      </div>
      <a-form-item v-if="form.type === 'website' || form.type === 'credential'" label="网站地址">
        <a-input v-model:value.trim="form.url" :maxlength="1000" placeholder="https://" />
      </a-form-item>
      <div v-if="form.type === 'credential'" class="work-material__form-grid">
        <a-form-item label="登录账号">
          <a-input v-model:value.trim="form.username" :maxlength="240" />
        </a-form-item>
        <a-form-item label="密码">
          <a-input-password v-model:value="form.password" :maxlength="500" :placeholder="editingId ? '留空表示保留当前密码' : '可选，保存后默认隐藏'" />
        </a-form-item>
      </div>
      <div v-if="form.type === 'contact'" class="work-material__form-grid">
        <a-form-item label="联系人姓名">
          <a-input v-model:value.trim="form.contactName" :maxlength="120" />
        </a-form-item>
        <a-form-item label="联系电话">
          <a-input v-model:value.trim="form.contactPhone" :maxlength="80" />
        </a-form-item>
        <a-form-item label="联系邮箱">
          <a-input v-model:value.trim="form.contactEmail" :maxlength="160" />
        </a-form-item>
      </div>
      <a-form-item label="详细内容">
        <a-textarea v-model:value="form.content" :maxlength="10000" :auto-size="{ minRows: 4, maxRows: 10 }" placeholder="记录访问说明、交接信息、注意事项等" />
      </a-form-item>
      <a-form-item label="备注">
        <a-textarea v-model:value="form.note" :maxlength="2000" :auto-size="{ minRows: 2, maxRows: 5 }" />
      </a-form-item>
      <a-checkbox v-model:checked="form.isPinned">置顶这条资料</a-checkbox>
    </a-form>
  </a-modal>

  <a-modal
    v-model:open="viewOpen"
    :title="viewMaterial?.title || '资料详情'"
    :width="560"
    :footer="null"
    :body-style="{ maxHeight: '68vh', overflowY: 'auto' }"
    wrap-class-name="work-journal-dialog"
  >
    <div v-if="viewMaterial" class="work-material__detail">
      <div class="work-material__detail-type"><a-tag :color="typeColors[viewMaterial.type]">{{ typeLabels[viewMaterial.type] }}</a-tag><span v-if="viewMaterial.isPinned">已置顶</span></div>
      <div v-if="viewMaterial.url" class="work-material__detail-row"><span>网站地址</span><a :href="viewMaterial.url" target="_blank" rel="noreferrer">{{ viewMaterial.url }}</a></div>
      <div v-if="viewMaterial.username" class="work-material__detail-row"><span>登录账号</span><strong>{{ viewMaterial.username }}</strong></div>
      <div v-if="viewMaterial.passwordConfigured" class="work-material__detail-row"><span>密码</span><span class="work-material__secret">{{ revealedPassword ? revealedPassword : '••••••••' }}<a-button size="small" @click="revealPassword"><template #icon><Eye :size="14" /></template>{{ revealedPassword ? '隐藏' : '查看' }}</a-button><a-tooltip v-if="revealedPassword" title="复制密码"><a-button size="small" aria-label="复制密码" @click="copyPassword"><template #icon><Copy :size="14" /></template></a-button></a-tooltip></span></div>
      <div v-if="viewMaterial.contactName || viewMaterial.contactPhone || viewMaterial.contactEmail" class="work-material__detail-row"><span>联系人</span><strong>{{ [viewMaterial.contactName, viewMaterial.contactPhone, viewMaterial.contactEmail].filter(Boolean).join(' · ') }}</strong></div>
      <div class="work-material__detail-content"><span>详细内容</span><p>{{ viewMaterial.content || '未填写' }}</p></div>
      <div class="work-material__detail-content"><span>备注</span><p>{{ viewMaterial.note || '未填写' }}</p></div>
      <div class="work-material__detail-actions"><a-button @click="openEdit(viewMaterial); viewOpen = false"><template #icon><PencilLine :size="14" /></template>编辑资料</a-button></div>
    </div>
  </a-modal>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { Copy, Eye, PencilLine, Pin as PinIcon, Plus, Trash2 } from '@lucide/vue'
import { createWorkMaterial, deleteWorkMaterial, getWorkMaterial, listWorkMaterials, revealWorkMaterialPassword, updateWorkMaterial } from '@/services/workJournal'

const props = defineProps({
  open: { type: Boolean, default: false },
  employment: { type: Object, default: null }
})
const emit = defineEmits(['update:open', 'changed'])
const typeLabels = { website: '网站链接', credential: '账号凭证', contact: '联系方式', note: '普通记录' }
const typeColors = { website: 'blue', credential: 'orange', contact: 'green', note: 'default' }
const typeOptions = Object.entries(typeLabels).map(([value, label]) => ({ value, label }))
const materials = ref([])
const loading = ref(false)
const keyword = ref('')
const type = ref(undefined)
const editorOpen = ref(false)
const viewOpen = ref(false)
const saving = ref(false)
const deletingId = ref('')
const editingId = ref('')
const viewMaterial = ref(null)
const revealedPassword = ref('')
const form = reactive(createEmptyForm())

function createEmptyForm() {
  return { title: '', type: 'note', url: '', username: '', password: '', contactName: '', contactPhone: '', contactEmail: '', content: '', note: '', isPinned: false }
}

async function loadMaterials() {
  if (!props.open || !props.employment?.id) return
  loading.value = true
  try {
    const result = await listWorkMaterials(props.employment.id, { keyword: keyword.value.trim() || undefined, type: type.value || undefined, pageSize: 100 })
    materials.value = result.items || []
  } catch (error) {
    message.error(error.message || '加载补充资料失败')
  } finally {
    loading.value = false
  }
}

function handleKeywordChange() {
  if (!keyword.value.trim()) loadMaterials()
}

function close() {
  emit('update:open', false)
}

function resetForm() {
  editingId.value = ''
  Object.assign(form, createEmptyForm())
}

function openCreate() {
  resetForm()
  editorOpen.value = true
}

function openEdit(item) {
  editingId.value = item.id
  Object.assign(form, {
    title: item.title,
    type: item.type,
    url: item.url || '',
    username: item.username || '',
    password: '',
    contactName: item.contactName || '',
    contactPhone: item.contactPhone || '',
    contactEmail: item.contactEmail || '',
    content: item.content || '',
    note: item.note || '',
    isPinned: Boolean(item.isPinned)
  })
  editorOpen.value = true
}

async function save() {
  if (!form.title.trim() || !form.type || !props.employment?.id) return
  saving.value = true
  try {
    const payload = { ...form }
    if (editingId.value && !payload.password) delete payload.password
    if (editingId.value) await updateWorkMaterial(editingId.value, payload)
    else await createWorkMaterial(props.employment.id, payload)
    message.success(editingId.value ? '补充资料已更新' : '补充资料已创建')
    editorOpen.value = false
    resetForm()
    emit('changed')
    await loadMaterials()
  } catch (error) {
    message.error(error.message || '保存补充资料失败')
  } finally {
    saving.value = false
  }
}

async function openView(item) {
  revealedPassword.value = ''
  try {
    viewMaterial.value = await getWorkMaterial(item.id)
    viewOpen.value = true
  } catch (error) {
    message.error(error.message || '加载资料详情失败')
  }
}

async function revealPassword() {
  if (!viewMaterial.value?.id) return
  if (revealedPassword.value) {
    revealedPassword.value = ''
    return
  }
  try {
    const result = await revealWorkMaterialPassword(viewMaterial.value.id)
    revealedPassword.value = result.password || ''
  } catch (error) {
    message.error(error.message || '查看密码失败')
  }
}

async function copyPassword() {
  if (!revealedPassword.value || !navigator.clipboard) return
  try {
    await navigator.clipboard.writeText(revealedPassword.value)
    message.success('密码已复制')
  } catch (error) {
    message.error('复制密码失败，请手动选择复制')
  }
}

async function remove(item) {
  deletingId.value = item.id
  try {
    await deleteWorkMaterial(item.id)
    message.success('补充资料已删除')
    emit('changed')
    await loadMaterials()
  } catch (error) {
    message.error(error.message || '删除补充资料失败')
  } finally {
    deletingId.value = ''
  }
}

function materialSummary(item) {
  if (item.type === 'credential') return [item.username && `账号：${item.username}`, item.passwordConfigured && '密码已保存'].filter(Boolean).join(' · ') || '未填写账号信息'
  if (item.type === 'website') return item.url || '未填写网址'
  if (item.type === 'contact') return [item.contactName, item.contactPhone, item.contactEmail].filter(Boolean).join(' · ') || '未填写联系方式'
  return item.content ? item.content.slice(0, 90) : '普通记录'
}

watch(() => props.open, (visible) => {
  if (visible) loadMaterials()
  else {
    editorOpen.value = false
    viewOpen.value = false
    viewMaterial.value = null
  }
})
</script>

<style scoped>
.work-material {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  gap: 14px;
}

.work-material__context {
  display: grid;
  gap: 3px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--console-border, #ebeef5);
}

.work-material__context span,
.work-material__item-meta,
.work-material__item-note,
.work-material__detail-type span {
  color: var(--console-text-secondary, #667085);
  font-size: 12px;
}

.work-material__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.work-material__toolbar :deep(.ant-input-search) {
  min-width: 0;
  flex: 1;
}

.work-material__type {
  width: 118px;
  flex: 0 0 118px;
}

.work-material__body {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.work-material__list {
  display: grid;
  gap: 8px;
}

.work-material__item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--console-border, #ebeef5);
  border-radius: 6px;
}

.work-material__item-main {
  min-width: 0;
}

.work-material__item-title,
.work-material__item-meta,
.work-material__secret,
.work-material__detail-type,
.work-material__detail-row,
.work-material__detail-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.work-material__item-title {
  color: var(--console-text, #303133);
}

.work-material__item-title strong,
.work-material__item-meta span,
.work-material__item-note {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-material__pin {
  color: #d97706;
}

.work-material__item-meta {
  margin-top: 5px;
}

.work-material__item-meta :deep(.ant-tag) {
  margin-inline-end: 0;
}

.work-material__item-note {
  margin: 6px 0 0;
}

.work-material__actions {
  flex: 0 0 auto;
}

.work-material__form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 14px;
}

.work-material__detail {
  display: grid;
  gap: 14px;
}

.work-material__detail-type {
  padding-bottom: 10px;
  border-bottom: 1px solid var(--console-border, #ebeef5);
}

.work-material__detail-row {
  justify-content: space-between;
  min-width: 0;
}

.work-material__detail-row > span:first-child,
.work-material__detail-content > span {
  color: var(--console-text-secondary, #667085);
  font-size: 12px;
}

.work-material__detail-row > :last-child {
  min-width: 0;
  overflow-wrap: anywhere;
  text-align: right;
}

.work-material__secret {
  justify-content: flex-end;
}

.work-material__detail-content p {
  margin: 6px 0 0;
  color: var(--console-text, #303133);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.work-material__detail-actions {
  justify-content: flex-end;
  padding-top: 4px;
}

@media (max-width: 640px) {
  .work-material__toolbar {
    flex-wrap: wrap;
  }

  .work-material__toolbar :deep(.ant-input-search) {
    flex-basis: 100%;
  }

  .work-material__form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
