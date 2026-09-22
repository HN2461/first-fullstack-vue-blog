<template>
  <section class="festival-settings">
    <div class="festival-settings__title">
      <div class="festival-label">
        <strong>日历数据</strong>
        <a-tooltip title="法定安排、固定节日和管理员维护的系统广播纪念日会进入站点日历；个人生日和个人日期只对当前用户显示。">
          <QuestionCircleOutlined class="field-help" />
        </a-tooltip>
      </div>
      <span>管理员只维护面向全站用户的系统广播纪念日，不修改固定节日分类。</span>
    </div>

    <div class="festival-sync">
      <div class="festival-sync__copy">
        <div class="festival-label">
          <strong>法定节假日</strong>
          <a-tooltip title="按年份从 holiday-cn 同步，失败时使用备用数据源。同步只更新法定放假与调休数据，不影响系统广播纪念日。">
            <QuestionCircleOutlined class="field-help" />
          </a-tooltip>
        </div>
        <span>{{ year }} 年放假与调休数据</span>
      </div>
      <div class="festival-sync__actions">
        <a-input-number v-model:value="year" class="festival-year" :min="2000" :max="2100" aria-label="同步年份" />
        <a-button :loading="syncing" @click="sync">
          <template #icon><RefreshCw :size="15" /></template>
          同步安排
        </a-button>
      </div>
    </div>

    <a-alert v-if="syncMessage" class="festival-sync__result" type="success" show-icon :message="syncMessage" />

    <div class="custom-festival__head">
      <div>
        <div class="festival-label">
          <strong>系统广播纪念日</strong>
          <a-tooltip title="系统广播纪念日由管理员维护，会显示给所有用户；删除操作只会移入停用列表，后续可以恢复。">
            <QuestionCircleOutlined class="field-help" />
          </a-tooltip>
        </div>
        <span>{{ activeItems.length ? `已启用 ${activeItems.length} 项` : '暂无启用的系统广播纪念日' }}</span>
      </div>
      <a-button type="primary" @click="openCreateModal">
        <template #icon><Plus :size="15" /></template>
        新增广播纪念日
      </a-button>
    </div>

    <div class="custom-festival__body">
      <a-skeleton v-if="loading" active :paragraph="{ rows: 2 }" />
      <a-list v-else-if="items.length" :data-source="items" size="small" class="festival-settings__list">
        <template #renderItem="{ item }">
          <a-list-item :class="{ 'festival-list-item--archived': item.deletedAt }">
            <a-list-item-meta>
              <template #title>
                <div class="festival-item-title">
                  <span>{{ item.month }}月{{ item.day }}日 · {{ item.name }}</span>
                  <a-tag color="blue">系统广播</a-tag>
                  <a-tag v-if="item.deletedAt" color="default">已停用</a-tag>
                </div>
              </template>
              <template #description>
                <div class="festival-item-description">
                  <span>{{ item.greeting || '未设置广播祝福语，将使用系统默认文案。' }}</span>
                  <small>{{ item.source || '管理员维护' }}</small>
                </div>
              </template>
            </a-list-item-meta>
            <template #actions>
              <template v-if="item.deletedAt">
                <a-button type="link" size="small" @click="restore(item)">恢复</a-button>
              </template>
              <template v-else>
                <a-switch :checked="item.enabled" checked-children="启用" un-checked-children="停用" @change="toggle(item)" />
                <a-tooltip title="编辑广播纪念日">
                  <a-button type="text" size="small" aria-label="编辑广播纪念日" @click="openEditModal(item)">
                    <template #icon><Pencil :size="15" /></template>
                  </a-button>
                </a-tooltip>
                <a-popconfirm title="将移入停用列表，之后可以恢复。确认继续？" ok-text="停用" cancel-text="取消" @confirm="remove(item)">
                  <a-tooltip title="停用广播纪念日">
                    <a-button type="text" danger size="small" aria-label="停用广播纪念日">
                      <template #icon><Trash2 :size="15" /></template>
                    </a-button>
                  </a-tooltip>
                </a-popconfirm>
              </template>
            </template>
          </a-list-item>
        </template>
      </a-list>
      <a-empty v-else description="暂无系统广播纪念日" :image-style="{ height: '48px' }" />
    </div>

    <a-modal
      v-model:open="open"
      :title="editingId ? '编辑系统广播纪念日' : '新增系统广播纪念日'"
      :width="560"
      :confirm-loading="saving"
      :body-style="{ maxHeight: '64vh', overflowY: 'auto' }"
      centered
      @ok="save"
    >
      <a-alert
        class="festival-form-intro"
        type="info"
        show-icon
        message="这是系统广播日期"
        description="保存后会展示给所有用户。分类由系统固定为“系统广播纪念日”，你只需要填写日期和希望展示的内容。"
      />
      <a-form layout="vertical">
        <a-form-item label="纪念日名称" required>
          <a-input v-model:value.trim="form.name" :maxlength="50" placeholder="例如：网站首次成功运行纪念日" />
        </a-form-item>
        <a-form-item label="日期" required>
          <a-space>
            <a-input-number v-model:value="form.month" :min="1" :max="12" />
            <span>月</span>
            <a-input-number v-model:value="form.day" :min="1" :max="31" />
            <span>日</span>
          </a-space>
          <div class="form-hint">系统广播纪念日按月日每年重复。</div>
        </a-form-item>
        <a-form-item label="广播祝福语">
          <a-textarea v-model:value.trim="form.greeting" :rows="3" :maxlength="120" show-count placeholder="例如：愿每一次记录都有回响。" />
          <div class="form-hint">顶部节日弹框会优先展示这句话；不填写时使用系统默认文案。</div>
        </a-form-item>
        <a-form-item label="来源说明">
          <a-input v-model:value.trim="form.source" :maxlength="100" placeholder="例如：项目部署记录、个人重要节点" />
        </a-form-item>
        <div class="festival-form-row">
          <a-form-item label="重点日期">
            <a-switch v-model:checked="form.isMajor" />
            <div class="form-hint">重点日期可参与自动节日提醒。</div>
          </a-form-item>
          <a-form-item label="启用状态">
            <a-switch v-model:checked="form.enabled" />
            <div class="form-hint">停用后不会显示给用户。</div>
          </a-form-item>
        </div>
      </a-form>
    </a-modal>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-vue-next'
import {
  createAdminFestival,
  deleteAdminFestival,
  listAdminFestivals,
  restoreAdminFestival,
  syncAdminFestivals,
  updateAdminFestival
} from '@/services/admin'

const initialForm = {
  name: '',
  month: 1,
  day: 1,
  source: '管理员维护',
  greeting: '',
  isMajor: false,
  enabled: true
}

const year = ref(new Date().getFullYear())
const loading = ref(false)
const syncing = ref(false)
const saving = ref(false)
const open = ref(false)
const editingId = ref('')
const items = ref([])
const syncMessage = ref('')
const form = reactive({ ...initialForm })
const activeItems = computed(() => items.value.filter((item) => !item.deletedAt && item.enabled !== false))

function resetForm() {
  Object.assign(form, initialForm)
  editingId.value = ''
}

function openCreateModal() {
  resetForm()
  open.value = true
}

function openEditModal(item) {
  Object.assign(form, {
    name: item.name || '',
    month: item.month || 1,
    day: item.day || 1,
    source: item.source || '管理员维护',
    greeting: item.greeting || '',
    isMajor: item.isMajor === true,
    enabled: item.enabled !== false
  })
  editingId.value = item._id || item.id
  open.value = true
}

async function load() {
  loading.value = true
  try {
    items.value = await listAdminFestivals()
  } finally {
    loading.value = false
  }
}

async function sync() {
  syncing.value = true
  try {
    const result = await syncAdminFestivals(year.value)
    syncMessage.value = `${result.year} 年已从 ${result.source} 同步 ${result.count} 条法定安排`
    message.success('法定安排同步完成')
  } catch (error) {
    message.error(error.message || '同步失败，已保留历史缓存')
  } finally {
    syncing.value = false
  }
}

function validateForm() {
  if (!form.name) return '请输入纪念日名称'
  const date = new Date(Date.UTC(2000, Number(form.month) - 1, Number(form.day)))
  if (date.getUTCMonth() !== Number(form.month) - 1 || date.getUTCDate() !== Number(form.day)) return '请输入有效的月日组合'
  return ''
}

async function save() {
  const validationMessage = validateForm()
  if (validationMessage) return message.warning(validationMessage)
  saving.value = true
  const targetId = editingId.value
  try {
    const payload = { ...form }
    if (targetId) await updateAdminFestival(targetId, payload)
    else await createAdminFestival(payload)
    open.value = false
    await load()
    message.success(targetId ? '纪念日已更新' : '系统广播纪念日已创建')
    resetForm()
  } finally {
    saving.value = false
  }
}

async function toggle(item) {
  await updateAdminFestival(item._id || item.id, { enabled: !item.enabled })
  await load()
}

async function remove(item) {
  await deleteAdminFestival(item._id || item.id)
  await load()
  message.success('纪念日已移入停用列表，可随时恢复')
}

async function restore(item) {
  await restoreAdminFestival(item._id || item.id)
  await load()
  message.success('纪念日已恢复')
}

onMounted(load)
</script>

<style scoped>
.festival-settings { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--console-border); }
.festival-settings__title, .festival-sync__copy, .custom-festival__head > div { display: grid; gap: 4px; }
.festival-settings__title { margin-bottom: 14px; }
.festival-label { display: flex; align-items: center; gap: 6px; }
.field-help { color: var(--console-text-secondary); font-size: 14px; cursor: help; transition: color 0.2s; }
.field-help:hover { color: var(--console-primary-strong); }
.festival-settings__title strong, .festival-sync__copy strong, .custom-festival__head strong { color: var(--console-text); font-size: 14px; font-weight: 600; }
.festival-settings__title span, .festival-sync__copy span, .custom-festival__head span { color: var(--console-text-secondary); font-size: 12px; line-height: 1.6; }
.festival-sync { min-height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 14px; border-left: 3px solid var(--console-primary); background: var(--console-surface-muted); }
.festival-sync__actions, .custom-festival__head { display: flex; align-items: center; gap: 10px; }
.festival-year { width: 112px; }
.festival-sync__result { margin-top: 12px; }
.custom-festival__head { justify-content: space-between; margin-top: 22px; margin-bottom: 10px; }
.custom-festival__body { min-height: 132px; padding-top: 4px; }
.festival-settings__list { max-height: 340px; overflow: auto; }
.festival-list-item--archived { opacity: 0.68; }
.festival-item-title { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.festival-item-description { display: grid; gap: 3px; line-height: 1.5; }
.festival-item-description small { color: var(--console-text-secondary); }
.festival-form-intro { margin-bottom: 18px; }
.festival-form-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.form-hint { margin-top: 5px; color: var(--console-text-secondary); font-size: 12px; line-height: 1.5; }
.custom-festival__body :deep(.ant-empty) { margin-block: 28px 18px; }
@media (max-width: 640px) {
  .festival-sync, .custom-festival__head { align-items: flex-start; flex-direction: column; }
  .festival-sync__actions { width: 100%; flex-wrap: wrap; }
  .festival-form-row { grid-template-columns: 1fr; gap: 0; }
}
</style>
