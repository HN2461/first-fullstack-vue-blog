<template>
  <section class="personal-dates">
    <div class="personal-dates__head"><div><strong>个人日期提醒</strong><span>只对你自己显示，可设置生日、纪念日和一次性出行日期。</span></div><a-button type="dashed" @click="addItem">新增日期</a-button></div>
    <a-empty v-if="!modelValue.length" description="暂未设置个人日期" />
    <div v-for="(item, index) in modelValue" :key="item.id || index" class="personal-date-row">
      <a-input v-model:value="item.name" placeholder="例如：妈妈生日" :maxlength="40" />
      <a-select v-model:value="item.type" :options="typeOptions" />
      <a-input v-model:value="item.date" type="date" />
      <a-select v-model:value="item.calendar" :options="calendarOptions" :disabled="item.type === 'trip'" />
      <a-checkbox v-model:checked="item.repeatYearly">每年提醒</a-checkbox>
      <a-button danger type="text" @click="removeItem(index)">删除</a-button>
    </div>
  </section>
</template>
<script setup>
const props = defineProps({ modelValue: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const typeOptions = [{ value: 'family-birthday', label: '家人生日' }, { value: 'wedding-anniversary', label: '结婚纪念日' }, { value: 'trip', label: '出行计划' }, { value: 'custom', label: '其他日期' }]
const calendarOptions = [{ value: 'solar', label: '阳历' }, { value: 'lunar', label: '农历' }]
function addItem() {
  emit('update:modelValue', [...props.modelValue, {
    name: '', type: 'family-birthday', date: '', calendar: 'solar', repeatYearly: true, enabled: true
  }])
}
function removeItem(index) {
  const next = [...props.modelValue]
  next.splice(index, 1)
  emit('update:modelValue', next)
}
</script>
<style scoped>
.personal-dates { margin: 20px 0; padding-top: 20px; border-top: 1px solid var(--console-border); }.personal-dates__head { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px; }.personal-dates__head strong,.personal-dates__head span { display:block; }.personal-dates__head span { margin-top:4px; color:var(--console-text-secondary); font-size:12px; }.personal-date-row { display:grid; grid-template-columns:1.2fr 1fr 1.1fr .8fr auto auto; align-items:center; gap:8px; margin-bottom:8px; }.personal-date-row :deep(.ant-input),.personal-date-row :deep(.ant-select) { min-width:0; } @media (max-width:900px) { .personal-date-row { grid-template-columns:1fr 1fr; }.personal-date-row .ant-checkbox-wrapper { grid-column:span 2; } }
</style>
