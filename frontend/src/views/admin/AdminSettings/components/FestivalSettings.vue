<template>
  <section class="festival-settings">
    <div class="festival-settings__head"><div><strong>节日与纪念日</strong><span>法定安排自动同步；临时和地方性纪念日可在此维护。</span></div><div class="festival-settings__actions"><a-input-number v-model:value="year" :min="2000" :max="2100" /><a-button :loading="syncing" @click="sync">同步法定安排</a-button><a-button type="primary" @click="open = true">新增纪念日</a-button></div></div>
    <a-alert v-if="syncMessage" type="info" show-icon :message="syncMessage" />
    <a-list :data-source="items" size="small" :loading="loading" class="festival-settings__list"><template #renderItem="{ item }"><a-list-item><a-list-item-meta :title="`${item.month}月${item.day}日 · ${item.name}`" :description="`${categoryLabel(item.category)} · ${item.source || '管理员维护'}`" /><template #actions><a-switch :checked="item.enabled" checked-children="启用" un-checked-children="停用" @change="toggle(item)" /><a-popconfirm title="删除后无法恢复，确认删除？" @confirm="remove(item)"><a-button danger type="link">删除</a-button></a-popconfirm></template></a-list-item></template></a-list>
    <a-empty v-if="!loading && !items.length" description="暂无自定义纪念日" />
    <a-modal v-model:open="open" title="新增纪念日" :confirm-loading="saving" @ok="create"><a-form layout="vertical"><a-form-item label="名称"><a-input v-model:value.trim="form.name" /></a-form-item><a-form-item label="日期"><a-space><a-input-number v-model:value="form.month" :min="1" :max="12" /><span>月</span><a-input-number v-model:value="form.day" :min="1" :max="31" /><span>日</span></a-space></a-form-item><a-form-item label="分类"><a-select v-model:value="form.category" :options="categories" /></a-form-item><a-form-item label="来源说明"><a-input v-model:value.trim="form.source" /></a-form-item><a-form-item label="重点日期"><a-switch v-model:checked="form.isMajor" /></a-form-item></a-form></a-modal>
  </section>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { createAdminFestival, deleteAdminFestival, listAdminFestivals, syncAdminFestivals, updateAdminFestival } from '@/services/admin'
const year = ref(new Date().getFullYear())
const loading = ref(false)
const syncing = ref(false)
const saving = ref(false)
const open = ref(false)
const items = ref([])
const syncMessage = ref('')
const categories = [{ value: 'national', label: '国家纪念日' }, { value: 'industry', label: '行业纪念日' }, { value: 'international', label: '国际纪念日' }, { value: 'social', label: '社会节日' }]
const form = reactive({ name: '', month: 1, day: 1, category: 'national', source: '管理员维护', isMajor: false })
const categoryLabel = (value) => categories.find((item) => item.value === value)?.label || value
async function load() {
  loading.value = true
  try { items.value = await listAdminFestivals() } finally { loading.value = false }
}
async function sync() {
  syncing.value = true
  try { const result = await syncAdminFestivals(year.value); syncMessage.value = `${result.year} 年已从 ${result.source} 同步 ${result.count} 条安排`; message.success('同步完成') } catch (error) { message.error(error.message || '同步失败，已保留历史缓存') } finally { syncing.value = false }
}
async function create() {
  if (!form.name) return message.warning('请输入纪念日名称')
  saving.value = true
  try { await createAdminFestival(form); open.value = false; await load(); message.success('纪念日已创建') } finally { saving.value = false }
}
async function toggle(item) { await updateAdminFestival(item._id || item.id, { enabled: !item.enabled }); await load() }
async function remove(item) { await deleteAdminFestival(item._id || item.id); await load(); message.success('纪念日已删除') }
onMounted(load)
</script>
<style scoped>
.festival-settings { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--console-border); }.festival-settings__head,.festival-settings__actions { display:flex; align-items:center; gap:10px; }.festival-settings__head { justify-content:space-between; margin-bottom:14px; }.festival-settings__head strong,.festival-settings__head span { display:block; }.festival-settings__head span { margin-top:4px; font-size:12px; color:var(--console-text-secondary); }.festival-settings__list { max-height:260px; overflow:auto; margin-top:12px; } @media (max-width:640px) { .festival-settings__head { align-items:flex-start; flex-direction:column; }.festival-settings__actions { flex-wrap:wrap; } }
</style>
