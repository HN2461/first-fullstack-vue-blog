<template>
  <section class="todo-page">
    <a-alert v-if="errorMessage" type="error" show-icon :message="errorMessage" />

    <div class="todo-layout">
      <aside class="todo-sidebar">
        <div class="todo-sidebar__header">
          <strong>待办清单</strong>
          <div class="todo-sidebar__header-actions">
            <a-tooltip title="刷新待办清单">
              <button class="todo-sidebar__refresh" type="button" aria-label="刷新待办清单" :disabled="loading" @click="refreshAll()">
                <ReloadOutlined />
              </button>
            </a-tooltip>
            <a-tooltip title="新建清单">
              <a-button type="primary" size="small" @click="openListModal()">
                <template #icon><PlusOutlined /></template>
                新建
              </a-button>
            </a-tooltip>
          </div>
        </div>
        <div class="todo-sidebar__section-title">视图</div>
        <button
          v-for="view in viewOptions"
          :key="view.value"
          type="button"
          :class="['todo-nav-item', { 'todo-nav-item--active': currentView === view.value }]"
          @click="selectView(view.value)"
        >
          <component :is="view.icon" />
          <span>{{ view.label }}</span>
          <em v-if="view.count !== undefined">{{ view.count }}</em>
        </button>

        <div class="todo-sidebar__section-title todo-sidebar__section-title--lists">
          <span>我的清单</span>
        </div>
        <div v-if="visibleLists.length" class="todo-list-nav">
          <button
            v-for="list in visibleLists"
            :key="list.id"
            type="button"
            :class="['todo-list-nav__item', { 'todo-list-nav__item--active': selectedListId === list.id }]"
            @click="selectList(list.id)"
          >
            <component :is="getListTypeMeta(list.type).icon" />
            <span class="todo-list-nav__name">{{ list.title }}</span>
            <span class="todo-list-nav__count">{{ list.completedCount }}/{{ list.itemCount }}</span>
          </button>
        </div>
        <div v-else class="todo-sidebar__empty">还没有清单</div>
      </aside>

      <main class="todo-workspace">
        <template v-if="selectedList">
          <div class="todo-workspace__header">
            <div class="todo-workspace__heading">
              <div class="todo-workspace__heading-main">
                <h2>{{ selectedList.title }}</h2>
                <a-tag :bordered="false" :color="getListTypeMeta(selectedList.type).color">
                  {{ getListTypeMeta(selectedList.type).label }}
                </a-tag>
                <a-tag v-if="selectedList.planDate" :bordered="false" color="default">
                  <CalendarOutlined /> {{ formatDate(selectedList.planDate) }}
                </a-tag>
              </div>
              <div class="todo-progress-line">
                <a-progress
                  :percent="selectedProgress"
                  :show-info="false"
                  size="small"
                  status="active"
                />
                <span>{{ selectedList.completedCount }} / {{ selectedList.itemCount }} 已完成</span>
              </div>
            </div>
            <div class="todo-workspace__actions">
              <a-tooltip :title="selectedList.isPinned ? '取消置顶' : '置顶清单'">
                <a-button :class="{ 'todo-icon-btn--active': selectedList.isPinned }" aria-label="置顶清单" @click="togglePinList">
                  <template #icon><PushpinOutlined /></template>
                </a-button>
              </a-tooltip>
              <a-dropdown :trigger="['click']">
                <a-tooltip title="更多操作">
                  <a-button aria-label="更多操作">
                    <template #icon><MoreOutlined /></template>
                  </a-button>
                </a-tooltip>
                <template #overlay>
                  <a-menu @click="handleListAction">
                    <a-menu-item key="edit">
                      <template #icon><EditOutlined /></template>
                      编辑清单
                    </a-menu-item>
                    <a-menu-item key="archive">
                      <template #icon><InboxOutlined /></template>
                      {{ selectedList.status === 'archived' ? '恢复清单' : '归档清单' }}
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="delete" danger>
                      <template #icon><DeleteOutlined /></template>
                      删除清单
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </div>

          <div class="todo-quick-add">
            <PlusOutlined class="todo-quick-add__icon" />
            <a-input
              v-model:value="quickItemTitle"
              :disabled="selectedList.status === 'archived' || itemSubmitting"
              placeholder="添加一项，按 Enter 保存"
              @keydown.enter.prevent="submitQuickItem"
            />
          </div>

          <div v-if="items.length" class="todo-items">
            <div
              v-for="item in items"
              :key="item.id"
              :class="['todo-item', { 'todo-item--completed': item.completed }]"
            >
              <a-checkbox :checked="item.completed" :aria-label="`${item.completed ? '取消完成' : '完成'}：${item.title}`" @change="toggleItem(item)" />
              <div class="todo-item__body">
                <div class="todo-item__title-row">
                  <span class="todo-item__title">{{ item.title }}</span>
                  <a-tag v-if="item.priority !== 'medium'" :color="item.priority === 'high' ? 'warning' : 'default'" :bordered="false">
                    {{ item.priority === 'high' ? '高' : '低' }}
                  </a-tag>
                </div>
                <span v-if="item.note" class="todo-item__note">{{ item.note }}</span>
              </div>
              <div class="todo-item__actions">
                <a-tooltip title="编辑事项">
                  <a-button size="small" aria-label="编辑待办事项" @click="openItemModal(item)">
                    <template #icon><EditOutlined /></template>
                  </a-button>
                </a-tooltip>
                <a-popconfirm title="确定删除这项待办吗？" ok-text="删除" cancel-text="取消" @confirm="removeItem(item)">
                  <a-tooltip title="删除事项">
                    <a-button size="small" danger aria-label="删除待办事项">
                      <template #icon><DeleteOutlined /></template>
                    </a-button>
                  </a-tooltip>
                </a-popconfirm>
              </div>
            </div>
          </div>
          <div v-else class="todo-empty todo-empty--workspace">
            <CheckCircleOutlined />
            <strong>清单还是空的</strong>
            <span>从上方添加第一项待办事项</span>
          </div>
        </template>
        <div v-else class="todo-empty">
          <UnorderedListOutlined />
          <strong>选择一个清单开始</strong>
          <span>把今天、购物或出行要做的事情集中列出来</span>
          <a-button type="primary" @click="openListModal()">
            <template #icon><PlusOutlined /></template>
            新建清单
          </a-button>
        </div>
      </main>
    </div>

    <a-modal
      v-model:open="listModalOpen"
      :title="editingList ? '编辑清单' : '新建待办清单'"
      :confirm-loading="listSubmitting"
      :width="520"
      :body-style="{ maxHeight: '68vh', overflow: 'hidden' }"
      ok-text="保存"
      cancel-text="取消"
      @ok="submitList"
    >
      <div class="todo-modal-body">
        <a-form layout="vertical">
          <a-form-item label="清单名称" required>
            <a-input v-model:value="listForm.title" :maxlength="80" placeholder="例如：今天、购物清单、出行准备" />
          </a-form-item>
          <div class="todo-form-grid">
            <a-form-item label="清单类型">
              <a-select v-model:value="listForm.type" :options="listTypeOptions" show-search option-filter-prop="label" />
            </a-form-item>
            <a-form-item label="计划日期">
              <a-input v-model:value="listForm.planDate" type="date" />
            </a-form-item>
          </div>
          <a-checkbox v-model:checked="listForm.isPinned">置顶这张清单</a-checkbox>
        </a-form>
      </div>
    </a-modal>

    <a-modal
      v-model:open="itemModalOpen"
      title="编辑待办事项"
      :confirm-loading="itemSubmitting"
      :width="520"
      :body-style="{ maxHeight: '68vh', overflow: 'hidden' }"
      ok-text="保存"
      cancel-text="取消"
      @ok="submitItem"
    >
      <div class="todo-modal-body">
        <a-form layout="vertical">
          <a-form-item label="事项" required>
            <a-input v-model:value="itemForm.title" :maxlength="160" />
          </a-form-item>
          <a-form-item label="说明">
            <a-textarea v-model:value="itemForm.note" :maxlength="1000" :auto-size="{ minRows: 3, maxRows: 6 }" show-count />
          </a-form-item>
          <a-form-item label="优先级">
            <a-select v-model:value="itemForm.priority" :options="priorityOptions" show-search option-filter-prop="label" />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  MoreOutlined,
  PlusOutlined,
  PushpinOutlined,
  ReloadOutlined,
  UnorderedListOutlined
} from '@ant-design/icons-vue'
import {
  createTodoItem,
  createTodoList,
  deleteTodoItem,
  deleteTodoList,
  getTodoList,
  listTodoLists,
  updateTodoItem,
  updateTodoList
} from '@/services/todo'

const viewOptions = [
  { label: '今天', value: 'today', icon: CalendarOutlined },
  { label: '全部清单', value: 'all', icon: UnorderedListOutlined },
  { label: '已归档', value: 'archived', icon: InboxOutlined }
]
const listTypeOptions = [
  { label: '日计划', value: 'daily' },
  { label: '购物', value: 'shopping' },
  { label: '出行', value: 'travel' },
  { label: '自定义', value: 'custom' }
]
const priorityOptions = [
  { label: '低优先级', value: 'low' },
  { label: '中优先级', value: 'medium' },
  { label: '高优先级', value: 'high' }
]
const listTypeMeta = {
  daily: { label: '日计划', color: 'blue', icon: CalendarOutlined },
  shopping: { label: '购物', color: 'orange', icon: UnorderedListOutlined },
  travel: { label: '出行', color: 'cyan', icon: CheckSquareOutlined },
  custom: { label: '自定义', color: 'default', icon: InboxOutlined }
}

const loading = ref(false)
const listSubmitting = ref(false)
const itemSubmitting = ref(false)
const errorMessage = ref('')
const currentView = ref('today')
const selectedListId = ref('')
const lists = ref([])
const items = ref([])
const quickItemTitle = ref('')
const listModalOpen = ref(false)
const itemModalOpen = ref(false)
const editingList = ref(null)
const editingItem = ref(null)
const listForm = reactive({ title: '', type: 'daily', planDate: '', isPinned: false })
const itemForm = reactive({ title: '', note: '', priority: 'medium' })

const visibleLists = computed(() => {
  if (currentView.value === 'archived') return lists.value.filter((list) => list.status === 'archived')
  if (currentView.value === 'today') return lists.value.filter((list) => list.status === 'active' && isToday(list.planDate))
  return lists.value.filter((list) => list.status === 'active')
})
const selectedList = computed(() => lists.value.find((list) => list.id === selectedListId.value) || null)
const selectedProgress = computed(() => {
  if (!selectedList.value?.itemCount) return 0
  return Math.round((selectedList.value.completedCount / selectedList.value.itemCount) * 100)
})

function getListTypeMeta(type) {
  return listTypeMeta[type] || listTypeMeta.custom
}

function isToday(value) {
  if (!value) return false
  const date = new Date(value)
  const now = new Date()
  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate()
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function toDateInputValue(value) {
  return value ? formatDate(value) : ''
}

async function loadLists(preferredId = selectedListId.value) {
  const result = await listTodoLists({ status: currentView.value === 'archived' ? 'archived' : 'active' })
  lists.value = result.items || []
  const visible = visibleLists.value
  const nextId = visible.find((list) => list.id === preferredId)?.id || visible[0]?.id || ''
  selectedListId.value = nextId
  if (nextId) await loadSelectedList(nextId)
  else items.value = []
}

async function loadSelectedList(id) {
  const detail = await getTodoList(id)
  const index = lists.value.findIndex((list) => list.id === id)
  if (index >= 0) lists.value[index] = detail
  items.value = detail.items || []
}

async function refreshAll(preferredId = selectedListId.value) {
  loading.value = true
  errorMessage.value = ''
  try {
    await loadLists(preferredId)
  } catch (error) {
    errorMessage.value = error.message || '待办清单加载失败'
  } finally {
    loading.value = false
  }
}

async function selectView(view) {
  currentView.value = view
  await refreshAll('')
}

async function selectList(id) {
  selectedListId.value = id
  try {
    await loadSelectedList(id)
  } catch (error) {
    message.error(error.message || '清单加载失败')
  }
}

function resetListForm() {
  listForm.title = ''
  listForm.type = 'daily'
  listForm.planDate = formatDate(new Date())
  listForm.isPinned = false
}

function openListModal(list = null) {
  editingList.value = list
  if (list) {
    listForm.title = list.title
    listForm.type = list.type
    listForm.planDate = toDateInputValue(list.planDate)
    listForm.isPinned = list.isPinned === true
  } else resetListForm()
  listModalOpen.value = true
}

async function submitList() {
  if (!listForm.title.trim()) {
    message.warning('请输入清单名称')
    return
  }
  listSubmitting.value = true
  try {
    const payload = { ...listForm, title: listForm.title.trim(), planDate: listForm.planDate || null }
    const result = editingList.value
      ? await updateTodoList(editingList.value.id, payload)
      : await createTodoList(payload)
    message.success(editingList.value ? '清单已更新' : '清单已创建')
    listModalOpen.value = false
    await refreshAll(result.id)
  } catch (error) {
    message.error(error.message || '清单保存失败')
  } finally {
    listSubmitting.value = false
  }
}

async function togglePinList() {
  if (!selectedList.value) return
  await patchList({ isPinned: !selectedList.value.isPinned }, selectedList.value.isPinned ? '已取消置顶' : '已置顶')
}

async function toggleArchiveList() {
  if (!selectedList.value) return
  const archived = selectedList.value.status !== 'archived'
  await patchList({ status: archived ? 'archived' : 'active' }, archived ? '清单已归档' : '清单已恢复')
  await refreshAll('')
}

function handleListAction({ key }) {
  if (key === 'edit') openListModal(selectedList.value)
  if (key === 'archive') toggleArchiveList()
  if (key === 'delete') {
    // 菜单动作仍使用确认弹窗，避免误删清单及其全部事项。
    removeListWithConfirm()
  }
}

function removeListWithConfirm() {
  Modal.confirm({
    title: '确定删除这张清单及其全部事项吗？',
    okText: '删除',
    cancelText: '取消',
    okType: 'danger',
    onOk: removeList
  })
}

async function patchList(payload, successText) {
  try {
    const result = await updateTodoList(selectedList.value.id, payload)
    message.success(successText)
    await refreshAll(result.id)
  } catch (error) {
    message.error(error.message || '清单操作失败')
  }
}

async function removeList() {
  if (!selectedList.value) return
  try {
    await deleteTodoList(selectedList.value.id)
    message.success('清单已删除')
    await refreshAll('')
  } catch (error) {
    message.error(error.message || '清单删除失败')
  }
}

async function submitQuickItem() {
  if (!quickItemTitle.value.trim() || !selectedList.value || selectedList.value.status === 'archived') return
  itemSubmitting.value = true
  try {
    await createTodoItem(selectedList.value.id, { title: quickItemTitle.value.trim() })
    quickItemTitle.value = ''
    await refreshAll(selectedList.value.id)
  } catch (error) {
    message.error(error.message || '待办事项添加失败')
  } finally {
    itemSubmitting.value = false
  }
}

async function toggleItem(item) {
  try {
    await updateTodoItem(selectedList.value.id, item.id, { completed: !item.completed })
    await refreshAll(selectedList.value.id)
  } catch (error) {
    message.error(error.message || '待办事项更新失败')
  }
}

function openItemModal(item) {
  editingItem.value = item
  itemForm.title = item.title
  itemForm.note = item.note || ''
  itemForm.priority = item.priority || 'medium'
  itemModalOpen.value = true
}

async function submitItem() {
  if (!itemForm.title.trim() || !editingItem.value || !selectedList.value) {
    message.warning('请输入待办事项')
    return
  }
  itemSubmitting.value = true
  try {
    await updateTodoItem(selectedList.value.id, editingItem.value.id, { ...itemForm, title: itemForm.title.trim() })
    message.success('待办事项已更新')
    itemModalOpen.value = false
    await refreshAll(selectedList.value.id)
  } catch (error) {
    message.error(error.message || '待办事项保存失败')
  } finally {
    itemSubmitting.value = false
  }
}

async function removeItem(item) {
  try {
    await deleteTodoItem(selectedList.value.id, item.id)
    message.success('待办事项已删除')
    await refreshAll(selectedList.value.id)
  } catch (error) {
    message.error(error.message || '待办事项删除失败')
  }
}

onMounted(() => refreshAll())
</script>

<style scoped>
.todo-page {
  width: 100%;
  min-width: 0;
  height: 100%;
  height: var(--console-page-available-height);
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.todo-workspace__heading-main,
.todo-workspace__actions,
.todo-progress-line,
.todo-item,
.todo-item__title-row {
  display: flex;
  align-items: center;
}

.todo-page > :deep(.ant-alert) { flex-shrink: 0; }

.todo-layout {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
}

.todo-sidebar {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 18px 12px;
  overflow-y: auto;
  border-right: 1px solid var(--console-border);
  background: var(--console-surface-muted);
}
.todo-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 34px;
  padding: 0 10px 16px;
  color: var(--console-text);
  font-size: 16px;
}
.todo-sidebar__header-actions { display: flex; gap: 4px; }
.todo-sidebar__refresh {
  display: inline-grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--console-text-secondary);
  background: transparent;
  cursor: pointer;
}
.todo-sidebar__refresh:hover:not(:disabled) {
  color: var(--console-primary);
  border-color: var(--console-border);
  background: var(--console-surface);
}
.todo-sidebar__header-actions :deep(.ant-btn) { display: inline-flex; align-items: center; }
.todo-sidebar__refresh:disabled { cursor: not-allowed; opacity: .45; }
.todo-sidebar__section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 8px;
  color: var(--console-text-secondary);
  font-size: 12px;
  font-weight: 600;
}
.todo-sidebar__section-title--lists { margin-top: 24px; }
.todo-nav-item,
.todo-list-nav__item {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 38px;
  gap: 10px;
  border: 0;
  border-radius: 6px;
  padding: 0 10px;
  color: var(--console-text-secondary);
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.todo-nav-item:hover,
.todo-list-nav__item:hover { color: var(--console-text); background: var(--console-hover); }
.todo-nav-item--active,
.todo-list-nav__item--active { color: var(--console-primary); background: var(--console-primary-soft); font-weight: 600; }
.todo-nav-item em { margin-left: auto; color: var(--console-text-secondary); font-size: 12px; font-style: normal; }
.todo-list-nav { display: grid; min-height: 0; gap: 2px; overflow-y: auto; }
.todo-list-nav__name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.todo-list-nav__count { margin-left: auto; color: var(--console-text-secondary); font-size: 11px; white-space: nowrap; }
.todo-sidebar__empty { padding: 10px; color: var(--console-text-secondary); font-size: 12px; }

.todo-workspace { min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden; padding: 24px 28px; }
.todo-workspace__header { display: flex; flex-shrink: 0; align-items: center; justify-content: space-between; gap: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--console-border); }
.todo-workspace__heading { min-width: 0; flex: 1; display: flex; align-items: center; gap: 18px; }
.todo-workspace__heading-main { min-width: 0; flex: 0 1 auto; flex-wrap: wrap; gap: 8px; }
.todo-workspace h2 { margin: 0; color: var(--console-text); font-size: 20px; line-height: 28px; }
.todo-workspace__actions { gap: 4px; flex-shrink: 0; }
.todo-icon-btn--active { color: var(--console-primary) !important; border-color: var(--console-primary) !important; }
.todo-progress-line { min-width: 220px; max-width: 360px; flex: 1 1 240px; gap: 12px; }
.todo-progress-line .ant-progress { flex: 1; }
.todo-progress-line span { color: var(--console-text-secondary); font-size: 12px; white-space: nowrap; }

.todo-quick-add { display: flex; flex-shrink: 0; align-items: center; gap: 10px; margin: 18px 0 12px; padding: 0 12px; border: 1px solid var(--console-border); border-radius: 6px; background: var(--console-surface); }
.todo-quick-add:focus-within { border-color: var(--console-primary); box-shadow: 0 0 0 2px var(--console-primary-soft); }
.todo-quick-add__icon { color: var(--console-primary); }
.todo-quick-add :deep(.ant-input) { border: 0; box-shadow: none; }
.todo-items { min-height: 0; flex: 1; display: grid; align-content: start; gap: 2px; overflow-y: auto; padding-right: 4px; }
.todo-item { min-width: 0; gap: 12px; padding: 13px 8px; border-bottom: 1px solid var(--console-border); }
.todo-item:last-child { border-bottom: 0; }
.todo-item__body { min-width: 0; flex: 1; }
.todo-item__title-row { gap: 8px; min-width: 0; }
.todo-item__title { overflow: hidden; color: var(--console-text); font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.todo-item--completed .todo-item__title { color: var(--console-text-secondary); text-decoration: line-through; }
.todo-item__note { display: block; margin-top: 4px; overflow: hidden; color: var(--console-text-secondary); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.todo-item__actions { display: flex; gap: 4px; flex-shrink: 0; opacity: 0; transition: opacity .15s; }
.todo-item:hover .todo-item__actions { opacity: 1; }

.todo-empty { display: flex; min-height: 0; flex: 1; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: var(--console-text-secondary); text-align: center; }
.todo-empty > :first-child { color: var(--console-primary); font-size: 42px; opacity: .75; }
.todo-empty strong { color: var(--console-text); font-size: 16px; }
.todo-empty span { font-size: 13px; }
.todo-modal-body { max-height: min(60vh, 520px); overflow-y: auto; padding-right: 4px; }
.todo-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 12px; }

@media (max-width: 800px) {
  .todo-layout { grid-template-rows: auto minmax(0, 1fr); grid-template-columns: 1fr; }
  .todo-sidebar { border-right: 0; border-bottom: 1px solid var(--console-border); }
  .todo-sidebar__section-title--lists { margin-top: 14px; }
  .todo-list-nav { display: flex; overflow-x: auto; padding-bottom: 4px; }
  .todo-list-nav__item { width: auto; min-width: 160px; }
  .todo-workspace { padding: 20px 16px; }
}

@media (max-width: 560px) {
  .todo-workspace__header { align-items: stretch; flex-direction: column; }
  .todo-workspace__heading { align-items: flex-start; flex: 0 0 auto; flex-direction: column; gap: 10px; }
  .todo-progress-line { width: 100%; max-width: none; flex: 0 0 auto; }
  .todo-workspace__actions { width: 100%; justify-content: flex-end; }
  .todo-form-grid { grid-template-columns: 1fr; }
  .todo-item__actions { opacity: 1; }
}
</style>
