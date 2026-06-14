<template>
  <section class="migration-page">
    <header class="migration-header">
      <div>
        <h2>菜单 / 知识库迁移配置</h2>
        <p>直接编辑分类层级、排序和文章归属，按当前数据库内容手动对齐你的知识库目录习惯。</p>
      </div>
      <div class="migration-header-actions">
        <a-button @click="reloadAll" :loading="treeLoading">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
        <a-button type="primary" @click="openCreateModal()">
          <template #icon><PlusOutlined /></template>
          新增根分类
        </a-button>
      </div>
    </header>

    <div class="migration-grid">
      <a-card class="migration-tree-panel" :bordered="false">
        <div class="migration-panel-head">
          <div>
            <strong>分类树</strong>
            <span>共 {{ flatCategories.length }} 个节点</span>
          </div>
          <a-input-search
            v-model:value="categoryKeyword"
            placeholder="搜索分类名称或 slug"
            allow-clear
            style="width: 220px"
          />
        </div>

        <a-tree
          :tree-data="filteredTreeData"
          :selected-keys="selectedKeys"
          :expanded-keys="expandedKeys"
          block-node
          show-line
          @select="handleSelectTree"
          @expand="handleExpandTree"
        >
          <template #title="{ dataRef }">
            <span class="migration-tree-title">
              <span class="migration-tree-name">{{ dataRef.titleText }}</span>
              <a-tag v-if="dataRef.status === 'hidden'" color="default">隐藏</a-tag>
              <span class="migration-tree-count">{{ dataRef.articleCount || 0 }}</span>
            </span>
          </template>
        </a-tree>
      </a-card>

      <div class="migration-main">
        <a-card class="migration-detail-panel" :bordered="false">
          <div class="migration-panel-head">
            <div>
              <strong>当前分类</strong>
              <span>{{ currentCategory ? currentCategory.name : '未选择分类' }}</span>
            </div>
            <a-space>
              <a-button @click="openCreateModal(selectedCategoryId ? currentCategory?.id : null)">
                <template #icon><FolderAddOutlined /></template>
                新增子分类
              </a-button>
              <a-button :disabled="!currentCategory" @click="resetEditForm">
                <template #icon><UndoOutlined /></template>
                重置
              </a-button>
              <a-button
                type="primary"
                :disabled="!currentCategory"
                :loading="savingCategory"
                @click="saveSelectedCategory"
              >
                <template #icon><SaveOutlined /></template>
                保存修改
              </a-button>
                <a-popconfirm
                  :title="currentCategory ? `确定删除分类「${currentCategory.name}」？` : '请先选择分类'"
                  ok-text="删除"
                  cancel-text="取消"
                  :ok-button-props="{ danger: true }"
                  :disabled="!currentCategory"
                  @confirm="deleteSelectedCategory"
                >
                <a-button danger :disabled="!currentCategory" :loading="deletingCategory">
                  <template #icon><DeleteOutlined /></template>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </div>

          <template v-if="currentCategory">
            <a-form
              ref="editFormRef"
              :model="editForm"
              layout="vertical"
              class="migration-form"
            >
              <div class="migration-form-grid">
                <a-form-item
                  label="分类名称"
                  name="name"
                  :rules="[{ required: true, message: '请输入分类名称' }]"
                >
                  <a-input v-model:value.trim="editForm.name" placeholder="例如 JavaScript" />
                </a-form-item>
                <a-form-item label="Slug" name="slug">
                  <a-input v-model:value.trim="editForm.slug" placeholder="留空自动生成" />
                </a-form-item>
                <a-form-item label="父级分类" name="parent">
                  <a-tree-select
                    v-model:value="editForm.parent"
                    :tree-data="parentTreeData"
                    allow-clear
                    placeholder="保持为空则为顶级分类"
                    tree-default-expand-all
                  />
                </a-form-item>
                <a-form-item label="排序" name="sortOrder">
                  <a-input-number v-model:value="editForm.sortOrder" :min="0" :max="9999" style="width: 100%" />
                </a-form-item>
                <a-form-item label="状态" name="status">
                  <a-select v-model:value="editForm.status">
                    <a-select-option value="active">启用</a-select-option>
                    <a-select-option value="hidden">隐藏</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="说明" name="description" class="migration-description-field">
                  <a-textarea
                    v-model:value="editForm.description"
                    :rows="3"
                    placeholder="分类说明可留空"
                  />
                </a-form-item>
              </div>
            </a-form>

            <div class="migration-meta">
              <span>路径：{{ currentCategoryPath }}</span>
              <span>文章数：{{ currentCategory.articleCount || 0 }}</span>
              <span>创建时间：{{ formatDate(currentCategory.createdAt) }}</span>
            </div>
          </template>

          <a-empty v-else description="从左侧选择一个分类开始管理" />
        </a-card>

        <a-card class="migration-article-panel" :bordered="false">
          <div class="migration-panel-head">
            <div>
              <strong>分类文章</strong>
              <span>{{ selectedCategoryId ? '支持单篇文章迁移到任意分类' : '请选择一个分类后加载文章' }}</span>
            </div>
            <a-tag v-if="selectedCategoryId" color="processing">
              {{ branchArticlesTotal }} 篇
            </a-tag>
          </div>

          <BlogTable
            ref="articleTableRef"
            :key="selectedCategoryId || 'empty'"
            :api-fn="loadBranchArticles"
            :columns="articleColumns"
            :auto-load="Boolean(selectedCategoryId)"
            :page-size="8"
            :page-sizes="['8', '15', '30']"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'title'">
                <div class="migration-article-title">
                  <strong>{{ record.title }}</strong>
                  <span>{{ record.summary || '暂无摘要' }}</span>
                </div>
              </template>

              <template v-else-if="column.key === 'category'">
                <span>{{ record.category?.name || '未分类' }}</span>
              </template>

              <template v-else-if="column.key === 'publishedAt'">
                <span>{{ formatDate(record.publishedAt || record.createdAt) }}</span>
              </template>

              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="openMoveArticleModal(record)">
                    迁移文章
                  </a-button>
                </a-space>
              </template>
            </template>
          </BlogTable>
        </a-card>
      </div>
    </div>

    <a-modal
      v-model:open="createModalVisible"
      :title="createForm.id ? '编辑分类' : '新增分类'"
      :confirm-loading="createSubmitting"
      width="620px"
      destroy-on-close
      ok-text="确认"
      cancel-text="取消"
      @ok="submitCreateForm"
      @cancel="closeCreateModal"
    >
      <a-form ref="createFormRef" :model="createForm" layout="vertical" class="migration-modal-form">
        <div class="migration-form-grid">
          <a-form-item
            label="分类名称"
            name="name"
            :rules="[{ required: true, message: '请输入分类名称' }]"
          >
            <a-input v-model:value.trim="createForm.name" placeholder="例如 Vue" />
          </a-form-item>
          <a-form-item label="Slug" name="slug">
            <a-input v-model:value.trim="createForm.slug" placeholder="留空自动生成" />
          </a-form-item>
          <a-form-item label="父级分类" name="parent">
            <a-tree-select
              v-model:value="createForm.parent"
              :tree-data="createParentTreeData"
              allow-clear
              placeholder="留空则创建顶级分类"
              tree-default-expand-all
            />
          </a-form-item>
          <a-form-item label="排序" name="sortOrder">
            <a-input-number v-model:value="createForm.sortOrder" :min="0" :max="9999" style="width: 100%" />
          </a-form-item>
          <a-form-item label="状态" name="status">
            <a-select v-model:value="createForm.status">
              <a-select-option value="active">启用</a-select-option>
              <a-select-option value="hidden">隐藏</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="说明" name="description" class="migration-description-field">
            <a-textarea
              v-model:value="createForm.description"
              :rows="3"
              placeholder="分类说明可留空"
            />
          </a-form-item>
        </div>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="moveArticleModalVisible"
      title="迁移文章"
      :confirm-loading="movingArticle"
      width="540px"
      destroy-on-close
      ok-text="确认迁移"
      cancel-text="取消"
      @ok="submitMoveArticle"
      @cancel="closeMoveArticleModal"
    >
      <a-space direction="vertical" style="width: 100%" size="middle">
        <div class="migration-move-summary" v-if="movingArticleRecord">
          <strong>{{ movingArticleRecord.title }}</strong>
          <span>{{ movingArticleRecord.category?.name || '未分类' }}</span>
        </div>
        <a-form layout="vertical">
          <a-form-item label="目标分类">
            <a-tree-select
              v-model:value="moveArticleTargetId"
              :tree-data="articleMoveTreeData"
              allow-clear
              placeholder="选择要迁移到的分类"
              tree-default-expand-all
            />
          </a-form-item>
        </a-form>
      </a-space>
    </a-modal>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  DeleteOutlined,
  FolderAddOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  UndoOutlined
} from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import {
  createAdminCategory,
  deleteAdminCategory,
  listAdminCategoryArticles,
  listAdminCategoryTree,
  moveAdminArticleCategory,
  moveAdminCategory,
  updateAdminCategory
} from '@/services/admin'
import { useAdminActions } from '@/composables/useAdminUi'

const { runAction } = useAdminActions()

const treeLoading = ref(false)
const savingCategory = ref(false)
const deletingCategory = ref(false)
const createSubmitting = ref(false)
const movingArticle = ref(false)
const categoryTree = ref([])
const selectedCategoryId = ref('')
const selectedKeys = computed(() => (selectedCategoryId.value ? [selectedCategoryId.value] : []))
const expandedKeys = ref([])
const articleTableRef = ref(null)
const editFormRef = ref(null)
const createFormRef = ref(null)
const createModalVisible = ref(false)
const moveArticleModalVisible = ref(false)
const movingArticleRecord = ref(null)
const moveArticleTargetId = ref('')
const categoryKeyword = ref('')
const branchArticlesTotal = ref(0)

const editForm = reactive({
  id: '',
  name: '',
  slug: '',
  description: '',
  parent: null,
  sortOrder: 0,
  status: 'active'
})

const createForm = reactive({
  id: '',
  name: '',
  slug: '',
  description: '',
  parent: null,
  sortOrder: 0,
  status: 'active'
})

const articleColumns = [
  { title: '标题', key: 'title', ellipsis: true },
  { title: '当前分类', key: 'category', width: 180 },
  { title: '发布时间', key: 'publishedAt', width: 160 },
  { title: '操作', key: 'action', width: 120, align: 'center' }
]

function cloneCategoryTree(nodes = []) {
  return nodes.map((node) => ({
    ...node,
    titleText: node.name,
    key: node.id,
    value: node.id,
    title: `${node.name}${node.articleCount ? ` (${node.articleCount})` : ''}`,
    children: cloneCategoryTree(node.children || [])
  }))
}

function flattenCategoryTree(nodes = [], output = []) {
  for (const node of nodes) {
    output.push(node)
    if (node.children?.length) {
      flattenCategoryTree(node.children, output)
    }
  }
  return output
}

function findNodeById(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) {
      return node
    }
    const found = findNodeById(node.children || [], id)
    if (found) {
      return found
    }
  }
  return null
}

function findPath(nodes, id, trail = []) {
  for (const node of nodes) {
    const nextTrail = [...trail, node]
    if (node.id === id) {
      return nextTrail
    }
    const found = findPath(node.children || [], id, nextTrail)
    if (found) {
      return found
    }
  }
  return null
}

function collectDescendantIds(nodes, id) {
  const node = findNodeById(nodes, id)
  if (!node) {
    return []
  }

  const ids = [node.id]
  const walk = (children = []) => {
    for (const child of children) {
      ids.push(child.id)
      walk(child.children || [])
    }
  }
  walk(node.children || [])
  return ids
}

function filterTree(nodes, keyword) {
  const text = String(keyword || '').trim().toLowerCase()
  if (!text) {
    return nodes
  }

  return nodes
    .map((node) => {
      const children = filterTree(node.children || [], text)
      const hit = `${node.name} ${node.slug || ''}`.toLowerCase().includes(text)
      if (!hit && children.length === 0) {
        return null
      }

      return {
        ...node,
        children
      }
    })
    .filter(Boolean)
}

const normalizedTree = computed(() => cloneCategoryTree(categoryTree.value))
const flatCategories = computed(() => flattenCategoryTree(categoryTree.value))
const currentCategory = computed(() => findNodeById(categoryTree.value, selectedCategoryId.value))
const currentCategoryPath = computed(() => {
  const path = currentCategory.value ? findPath(categoryTree.value, currentCategory.value.id) : null
  return path?.map((node) => node.name).join(' / ') || '-'
})

const filteredTreeData = computed(() => filterTree(normalizedTree.value, categoryKeyword.value))
const parentTreeData = computed(() => {
  if (!selectedCategoryId.value) {
    return normalizedTree.value
  }

  const bannedIds = new Set(collectDescendantIds(categoryTree.value, selectedCategoryId.value))

  const walk = (nodes = []) => {
    return nodes
      .map((node) => {
        if (bannedIds.has(node.id)) {
          return null
        }

        return {
          ...node,
          children: walk(node.children || [])
        }
      })
      .filter(Boolean)
  }

  return walk(normalizedTree.value)
})

const createParentTreeData = computed(() => {
  if (!createForm.id) {
    return normalizedTree.value
  }

  const bannedIds = new Set(collectDescendantIds(categoryTree.value, createForm.id))

  const walk = (nodes = []) => {
    return nodes
      .map((node) => {
        if (bannedIds.has(node.id)) {
          return null
        }

        return {
          ...node,
          children: walk(node.children || [])
        }
      })
      .filter(Boolean)
  }

  return walk(normalizedTree.value)
})

const articleMoveTreeData = computed(() => normalizedTree.value)

async function reloadAll() {
  await loadCategoryTree()
  articleTableRef.value?.refresh?.()
}

async function loadCategoryTree() {
  treeLoading.value = true
  try {
    const tree = await listAdminCategoryTree()
    categoryTree.value = Array.isArray(tree) ? tree : []

    if (!selectedCategoryId.value) {
      selectedCategoryId.value = categoryTree.value[0]?.id || ''
    } else if (!findNodeById(categoryTree.value, selectedCategoryId.value)) {
      selectedCategoryId.value = categoryTree.value[0]?.id || ''
    }

    expandedKeys.value = selectedCategoryId.value ? (findPath(categoryTree.value, selectedCategoryId.value)?.map((node) => node.id) || []) : []
    syncEditForm()
  } finally {
    treeLoading.value = false
  }
}

function syncEditForm() {
  if (!currentCategory.value) {
    Object.assign(editForm, {
      id: '',
      name: '',
      slug: '',
      description: '',
      parent: null,
      sortOrder: 0,
      status: 'active'
    })
    return
  }

  Object.assign(editForm, {
    id: currentCategory.value.id,
    name: currentCategory.value.name || '',
    slug: currentCategory.value.slug || '',
    description: currentCategory.value.description || '',
    parent: currentCategory.value.parent || null,
    sortOrder: currentCategory.value.sortOrder ?? 0,
    status: currentCategory.value.status || 'active'
  })
}

function resetEditForm() {
  syncEditForm()
}

function handleSelectTree(selectedKeysValue) {
  const nextId = selectedKeysValue?.[0] || ''
  if (!nextId) {
    return
  }

  selectedCategoryId.value = nextId
  expandedKeys.value = findPath(categoryTree.value, nextId)?.map((node) => node.id) || []
  syncEditForm()
  articleTableRef.value?.refresh?.()
}

function handleExpandTree(keys) {
  expandedKeys.value = keys
}

async function saveSelectedCategory() {
  if (!currentCategory.value) {
    return
  }

  try {
    await editFormRef.value?.validateFields()
  } catch {
    return
  }

  savingCategory.value = true
  try {
    const hierarchyChanged = String(editForm.parent || '') !== String(currentCategory.value.parent || '') || Number(editForm.sortOrder) !== Number(currentCategory.value.sortOrder || 0)
    const profileChanged =
      editForm.name !== currentCategory.value.name ||
      (editForm.slug || '') !== (currentCategory.value.slug || '') ||
      (editForm.description || '') !== (currentCategory.value.description || '') ||
      editForm.status !== currentCategory.value.status

    await runAction(async () => {
      if (hierarchyChanged) {
        await moveAdminCategory(editForm.id, {
          targetParentId: editForm.parent || null,
          sortOrder: editForm.sortOrder
        })
      }

      if (profileChanged) {
        const payload = {
          name: editForm.name,
          description: editForm.description,
          status: editForm.status
        }

        if (String(editForm.slug || '').trim()) {
          payload.slug = editForm.slug
        }

        await updateAdminCategory(editForm.id, payload)
      }
    }, {
      successMessage: '分类已保存',
      errorMessage: '保存失败'
    })
    await reloadAll()
    selectedCategoryId.value = editForm.id
    expandedKeys.value = findPath(categoryTree.value, editForm.id)?.map((node) => node.id) || []
    syncEditForm()
  } finally {
    savingCategory.value = false
  }
}

async function deleteSelectedCategory() {
  if (!currentCategory.value) {
    return
  }

  deletingCategory.value = true
  try {
    await runAction(() => deleteAdminCategory(currentCategory.value.id), {
      successMessage: '分类已删除',
      errorMessage: '删除失败'
    })
    await reloadAll()
  } finally {
    deletingCategory.value = false
  }
}

function openCreateModal(parentId = null) {
  Object.assign(createForm, {
    id: '',
    name: '',
    slug: '',
    description: '',
    parent: parentId || null,
    sortOrder: currentCategory.value ? (currentCategory.value.sortOrder || 0) + 1 : 0,
    status: 'active'
  })
  createModalVisible.value = true
}

function closeCreateModal() {
  createModalVisible.value = false
}

async function submitCreateForm() {
  try {
    await createFormRef.value?.validateFields()
  } catch {
    return
  }

  createSubmitting.value = true
  try {
    const payload = {
      name: createForm.name,
      description: createForm.description,
      parent: createForm.parent || null,
      sortOrder: createForm.sortOrder,
      status: createForm.status
    }

    if (String(createForm.slug || '').trim()) {
      payload.slug = createForm.slug
    }

    const created = await runAction(() => createAdminCategory({
      ...payload
    }), {
      successMessage: '分类已创建',
      errorMessage: '创建失败'
    })

    createModalVisible.value = false
    await reloadAll()
    selectedCategoryId.value = created?.id || selectedCategoryId.value
    expandedKeys.value = findPath(categoryTree.value, selectedCategoryId.value)?.map((node) => node.id) || []
    syncEditForm()
  } finally {
    createSubmitting.value = false
  }
}

async function loadBranchArticles(params = {}) {
  if (!selectedCategoryId.value) {
    branchArticlesTotal.value = 0
    return { items: [], total: 0, page: 1, pageSize: params.pageSize || 8 }
  }

  const result = await listAdminCategoryArticles(selectedCategoryId.value, params)
  branchArticlesTotal.value = result.total || 0
  return result
}

function openMoveArticleModal(record) {
  movingArticleRecord.value = record
  moveArticleTargetId.value = ''
  moveArticleModalVisible.value = true
}

function closeMoveArticleModal() {
  moveArticleModalVisible.value = false
  movingArticleRecord.value = null
  moveArticleTargetId.value = ''
}

async function submitMoveArticle() {
  if (!movingArticleRecord.value || !moveArticleTargetId.value) {
    return
  }

  movingArticle.value = true
  try {
    await runAction(() => moveAdminArticleCategory(movingArticleRecord.value.id, moveArticleTargetId.value), {
      successMessage: '文章已迁移',
      errorMessage: '迁移失败'
    })
    closeMoveArticleModal()
    articleTableRef.value?.refresh?.()
    await reloadAll()
  } finally {
    movingArticle.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

watch(currentCategory, () => {
  syncEditForm()
})

onMounted(() => {
  loadCategoryTree()
})
</script>

<style scoped>
.migration-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.migration-header,
.migration-grid {
  width: 100%;
}

.migration-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  background: var(--console-surface);
  border: 1px solid var(--console-border);
  border-radius: 10px;
}

.migration-header h2 {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 650;
  color: var(--console-text);
}

.migration-header p {
  margin: 0;
  color: var(--console-text-secondary);
  font-size: 13px;
}

.migration-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.migration-grid {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 16px;
}

.migration-tree-panel,
.migration-detail-panel,
.migration-article-panel {
  min-width: 0;
  border-radius: 10px;
  border: 1px solid var(--console-border);
  background: var(--console-surface);
}

.migration-tree-panel :deep(.ant-card-body),
.migration-detail-panel :deep(.ant-card-body),
.migration-article-panel :deep(.ant-card-body) {
  padding: 16px;
}

.migration-tree-panel {
  min-height: 720px;
}

.migration-main {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 16px;
  min-width: 0;
}

.migration-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.migration-panel-head strong {
  display: block;
  color: var(--console-text);
  font-size: 16px;
  font-weight: 650;
}

.migration-panel-head span {
  color: var(--console-text-secondary);
  font-size: 13px;
}

.migration-tree-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.migration-tree-name {
  color: var(--console-text);
}

.migration-tree-count {
  margin-left: auto;
  color: var(--console-text-tertiary);
  font-size: 12px;
}

.migration-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.migration-description-field {
  grid-column: 1 / -1;
}

.migration-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 6px;
  padding-top: 14px;
  border-top: 1px solid var(--console-border);
  color: var(--console-text-secondary);
  font-size: 12px;
}

.migration-article-panel {
  min-height: 420px;
}

.migration-article-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.migration-article-title strong {
  font-size: 14px;
  color: var(--console-text);
}

.migration-article-title span {
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.migration-move-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--console-surface-muted);
  border: 1px solid var(--console-border);
}

.migration-move-summary strong {
  color: var(--console-text);
  font-size: 14px;
}

.migration-move-summary span {
  color: var(--console-text-secondary);
  font-size: 12px;
}

@media (max-width: 1280px) {
  .migration-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .migration-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .migration-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
