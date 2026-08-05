<template>
  <section class="festival-settings">
    <div class="festival-settings__title">
      <div class="festival-label">
        <strong>日历数据</strong>
        <a-tooltip title="这些数据用于站点日历、顶部节日倒计时和节日提醒，不会改变文章、菜单或系统权限。">
          <QuestionCircleOutlined class="field-help" />
        </a-tooltip>
      </div>
      <span>法定安排和管理员维护的公共纪念日会进入站点日历。</span>
    </div>

    <div class="festival-sync">
      <div class="festival-sync__copy">
        <div class="festival-label">
          <strong>法定节假日</strong>
          <a-tooltip title="按年份从 holiday-cn 同步，失败时使用备用数据源。重复同步会替换该年份的法定放假与调休缓存，不影响自定义纪念日。">
            <QuestionCircleOutlined class="field-help" />
          </a-tooltip>
        </div>
        <span>{{ year }} 年放假与调休数据</span>
      </div>
      <div class="festival-sync__actions">
        <a-input-number
          v-model:value="year"
          class="festival-year"
          :min="2000"
          :max="2100"
          aria-label="同步年份"
        />
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
          <strong>自定义纪念日</strong>
          <a-tooltip title="由管理员新增的公共日期会按月日每年重复，并展示给所有用户；这里不包含用户个人生日等私有日期。">
            <QuestionCircleOutlined class="field-help" />
          </a-tooltip>
        </div>
        <span>{{ items.length ? `已维护 ${items.length} 项` : '暂无管理员维护项目' }}</span>
      </div>
      <a-button type="primary" @click="openCreateModal">
        <template #icon><Plus :size="15" /></template>
        新增纪念日
      </a-button>
    </div>

    <div class="custom-festival__body">
      <a-skeleton v-if="loading" active :paragraph="{ rows: 2 }" />
      <a-list v-else-if="items.length" :data-source="items" size="small" class="festival-settings__list">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta
              :title="`${item.month}月${item.day}日 · ${item.name}`"
              :description="`${categoryLabel(item.category)} · ${item.source || '管理员维护'}`"
            />
            <template #actions>
              <a-switch
                :checked="item.enabled"
                checked-children="启用"
                un-checked-children="停用"
                @change="toggle(item)"
              />
              <a-popconfirm title="删除后无法恢复，确认删除？" @confirm="remove(item)">
                <a-tooltip title="删除纪念日">
                  <a-button type="text" danger size="small" aria-label="删除纪念日">
                    <template #icon><Trash2 :size="15" /></template>
                  </a-button>
                </a-tooltip>
              </a-popconfirm>
            </template>
          </a-list-item>
        </template>
      </a-list>
      <a-empty v-else description="暂无自定义纪念日" :image-style="{ height: '48px' }" />
    </div>

    <a-modal
      v-model:open="open"
      title="新增纪念日"
      :width="520"
      :confirm-loading="saving"
      :body-style="{ maxHeight: '60vh', overflowY: 'auto' }"
      centered
      @ok="create"
    >
      <a-form layout="vertical">
        <a-form-item label="名称" required>
          <a-input v-model:value.trim="form.name" :maxlength="50" placeholder="例如：程序员节" />
        </a-form-item>
        <a-form-item label="日期" required>
          <a-space>
            <a-input-number v-model:value="form.month" :min="1" :max="12" />
            <span>月</span>
            <a-input-number v-model:value="form.day" :min="1" :max="31" />
            <span>日</span>
          </a-space>
        </a-form-item>
        <a-form-item label="分类">
          <a-select
            v-model:value="form.category"
            :options="categories"
            show-search
            option-filter-prop="label"
          />
        </a-form-item>
        <a-form-item label="来源说明">
          <a-input v-model:value.trim="form.source" :maxlength="100" />
        </a-form-item>
        <a-form-item label="重点日期">
          <a-switch v-model:checked="form.isMajor" />
        </a-form-item>
      </a-form>
    </a-modal>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { Plus, RefreshCw, Trash2 } from 'lucide-vue-next'
import {
  createAdminFestival,
  deleteAdminFestival,
  listAdminFestivals,
  syncAdminFestivals,
  updateAdminFestival
} from '@/services/admin'

const initialForm = {
  name: '',
  month: 1,
  day: 1,
  category: 'national',
  source: '管理员维护',
  isMajor: false
}

const categories = [
  { value: 'national', label: '国家纪念日' },
  { value: 'industry', label: '行业纪念日' },
  { value: 'international', label: '国际纪念日' },
  { value: 'social', label: '社会节日' }
]

const year = ref(new Date().getFullYear())
const loading = ref(false)
const syncing = ref(false)
const saving = ref(false)
const open = ref(false)
const items = ref([])
const syncMessage = ref('')
const form = reactive({ ...initialForm })

const categoryLabel = (value) => categories.find((item) => item.value === value)?.label || value

function openCreateModal() {
  Object.assign(form, initialForm)
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

async function create() {
  if (!form.name) return message.warning('请输入纪念日名称')
  saving.value = true
  try {
    await createAdminFestival(form)
    open.value = false
    await load()
    message.success('纪念日已创建')
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
  message.success('纪念日已删除')
}

onMounted(load)
</script>

<style scoped>
.festival-settings {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--console-border);
}

.festival-settings__title,
.festival-sync__copy,
.custom-festival__head > div {
  display: grid;
  gap: 4px;
}

.festival-settings__title {
  margin-bottom: 14px;
}

.festival-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.field-help {
  color: var(--console-text-secondary);
  font-size: 14px;
  cursor: help;
  transition: color 0.2s;
}

.field-help:hover {
  color: var(--console-primary-strong);
}

.festival-settings__title strong,
.festival-sync__copy strong,
.custom-festival__head strong {
  color: var(--console-text);
  font-size: 14px;
  font-weight: 600;
}

.festival-settings__title span,
.festival-sync__copy span,
.custom-festival__head span {
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.festival-sync {
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border-left: 3px solid var(--console-primary);
  background: var(--console-surface-muted);
}

.festival-sync__actions,
.custom-festival__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.festival-year {
  width: 112px;
}

.festival-sync__result {
  margin-top: 12px;
}

.custom-festival__head {
  justify-content: space-between;
  margin-top: 22px;
  margin-bottom: 10px;
}

.custom-festival__body {
  min-height: 132px;
  padding-top: 4px;
}

.festival-settings__list {
  max-height: 260px;
  overflow: auto;
}

.custom-festival__body :deep(.ant-empty) {
  margin-block: 28px 18px;
}

@media (max-width: 640px) {
  .festival-sync,
  .custom-festival__head {
    align-items: flex-start;
    flex-direction: column;
  }

  .festival-sync__actions {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
