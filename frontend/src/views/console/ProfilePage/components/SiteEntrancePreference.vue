<template>
  <div class="site-entrance-preference">
    <div>
      <strong>网站入场欢迎</strong>
      <span>关闭屏蔽后，会接收管理员设置的网站欢迎；生日提醒和重大节日氛围按系统优先级依次展示。</span>
    </div>
    <a-switch
      :checked="value"
      checked-children="屏蔽"
      un-checked-children="接收"
      @change="$emit('update:value', $event)"
    />
  </div>
</template>

<script setup>
defineProps({
  value: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:value'])
</script>

<style scoped>
.site-entrance-preference {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  margin: 16px 0 20px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface-muted);
}

.site-entrance-preference > div {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.site-entrance-preference strong {
  color: var(--console-text);
  font-size: 14px;
}

.site-entrance-preference span {
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .site-entrance-preference {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
