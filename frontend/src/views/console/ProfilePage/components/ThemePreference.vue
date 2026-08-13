<template>
  <div class="theme-preference">
    <div class="theme-preference__copy">
      <strong>主题模式</strong>
      <span>跟随站点默认时，使用管理员当前配置的{{ siteDefaultLabel }}主题。</span>
    </div>
    <a-segmented
      :value="modelValue"
      :options="options"
      @update:value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'default'
  },
  siteDefaultTheme: {
    type: String,
    default: 'light'
  }
})

defineEmits(['update:modelValue'])

const siteDefaultLabel = computed(() => props.siteDefaultTheme === 'dark' ? '深色' : '浅色')
const options = [
  { label: '跟随站点默认', value: 'default' },
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' }
]
</script>

<style scoped>
.theme-preference {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--console-border);
  padding: 4px 0 20px;
}

.theme-preference__copy {
  min-width: 0;
}

.theme-preference strong,
.theme-preference span {
  display: block;
}

.theme-preference strong {
  color: var(--console-text);
  font-size: 14px;
  line-height: 22px;
}

.theme-preference span {
  margin-top: 3px;
  color: var(--console-text-secondary);
  font-size: 13px;
  line-height: 20px;
}

@media (max-width: 720px) {
  .theme-preference {
    align-items: flex-start;
    flex-direction: column;
  }

  .theme-preference :deep(.ant-segmented) {
    width: 100%;
  }
}
</style>
