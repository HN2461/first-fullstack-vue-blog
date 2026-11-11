<template>
  <a-modal
    :open="open"
    title="资源分类"
    :footer="null"
    centered
    width="min(880px, calc(100vw - 32px))"
    wrap-class-name="business-modal"
    :body-style="{ height: 'min(64vh, calc(100dvh - 190px))', overflow: 'hidden' }"
    @cancel="$emit('update:open', false)"
  >
    <div class="category-manager">
      <section class="category-manager__list">
        <a-alert v-if="error" type="error" :message="error" show-icon />
        <a-input-search v-model:value="keyword" placeholder="搜索分类" allow-clear />
        <a-empty v-if="!visibleCategories.length" description="没有匹配的分类" />
        <article v-for="item in visibleCategories" :key="item.id || item.name" class="category-manager__item">
          <div>
            <strong>{{ item.name }}</strong>
            <small>{{ item.description || '未填写说明' }}</small>
            <small>{{ item.count || 0 }} 个资源</small>
          </div>
          <a-tag v-if="item.system" :bordered="false">系统</a-tag>
          <a-tag v-else-if="item.accessMode === 'vault'" :bordered="false">密码箱</a-tag>
          <a-space v-else-if="canEdit(item)" :size="0">
            <a-tooltip title="编辑分类">
              <a-button type="text" size="small" aria-label="编辑分类" @click="edit(item)"><EditOutlined /></a-button>
            </a-tooltip>
            <a-tooltip title="删除分类">
              <a-button type="text" size="small" danger aria-label="删除分类" @click="remove(item)">
                <DeleteOutlined />
              </a-button>
            </a-tooltip>
          </a-space>
        </article>
      </section>
      <section class="category-manager__form">
        <div class="category-manager__heading">
          <strong>{{ editingId ? '编辑分类' : '新建分类' }}</strong>
          <a-tooltip title="系统分类由业务维护；密码箱在个人信息中设置密码。分类是归档标签，调整普通分类不会搬动文件。">
            <QuestionCircleOutlined aria-label="分类规则" />
          </a-tooltip>
        </div>
        <a-form layout="vertical" @submit.prevent="save">
          <a-form-item label="分类名称" required>
            <a-input v-model:value="draft.name" :maxlength="40" placeholder="例如项目截图" />
          </a-form-item>
          <a-form-item label="分类说明">
            <a-textarea v-model:value="draft.description" :rows="3" :maxlength="200" />
          </a-form-item>
          <a-space>
            <a-button type="primary" :loading="saving" html-type="submit">{{ editingId ? '保存' : '新建' }}</a-button>
            <a-button v-if="editingId" @click="reset">取消编辑</a-button>
          </a-space>
        </a-form>
      </section>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { EditOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import { createAdminMediaCategory, updateAdminMediaCategory, deleteAdminMediaCategory } from '@/services/admin'
import { useAuthStore } from '@/stores/auth'
import { useAdminActions } from '@/composables/useAdminUi'

const props = defineProps({ open: Boolean, categories: { type: Array, default: () => [] } })
const emit = defineEmits(['update:open', 'changed'])
const auth = useAuthStore()
const { confirmAction } = useAdminActions()
const keyword = ref('')
const editingId = ref('')
const draft = ref({ name: '', description: '' })
const saving = ref(false)
const error = ref('')
const visibleCategories = computed(() =>
  props.categories.filter((item) =>
    `${item.name} ${item.description || ''}`.toLowerCase().includes(keyword.value.trim().toLowerCase())
  )
)
watch(
  () => props.open,
  () => {
    reset()
    error.value = ''
    keyword.value = ''
  }
)
function reset() {
  editingId.value = ''
  draft.value = { name: '', description: '' }
}
function canEdit(item) {
  return (
    item.id && !item.system && item.accessMode !== 'vault' && String(item.owner || '') === String(auth.user?.id || '')
  )
}
function edit(item) {
  editingId.value = item.id
  draft.value = { name: item.name, description: item.description || '' }
}
async function save() {
  if (!draft.value.name.trim()) return message.warning('请输入分类名称')
  saving.value = true
  error.value = ''
  try {
    if (editingId.value) await updateAdminMediaCategory(editingId.value, draft.value)
    else await createAdminMediaCategory(draft.value)
    message.success('分类已保存')
    reset()
    emit('changed')
  } catch (reason) {
    error.value = reason.message || '分类保存失败'
  } finally {
    saving.value = false
  }
}
function remove(item) {
  confirmAction({
    title: '删除资源分类',
    content: `删除「${item.name}」后，其中的资源归入默认素材，原文件保留。`,
    okText: '删除分类',
    okType: 'danger',
    async onOk() {
      try {
        await deleteAdminMediaCategory(item.id)
        reset()
        emit('changed')
        message.success('分类已删除')
      } catch (reason) {
        error.value = reason.message || '删除失败'
        throw reason
      }
    }
  }).catch(() => {})
}
</script>

<style scoped>
.category-manager {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(240px, 1fr);
  gap: 20px;
  height: 100%;
  min-height: 0;
}
.category-manager__list,
.category-manager__form {
  min-height: 0;
  overflow: auto;
}
.category-manager__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 8px;
}
.category-manager__list > * {
  flex-shrink: 0;
}
.category-manager__item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid var(--console-border);
  padding: 8px 0;
}
.category-manager__item > div {
  display: grid;
  gap: 4px;
  min-width: 0;
}
.category-manager__item strong,
.category-manager__item small {
  overflow-wrap: anywhere;
}
.category-manager__item small {
  color: var(--console-text-secondary);
}
.category-manager__heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
@media (max-width: 640px) {
  .category-manager {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(120px, 1fr) minmax(0, 1fr);
    gap: 12px;
  }
}
</style>
