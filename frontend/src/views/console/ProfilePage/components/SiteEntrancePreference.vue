<template>
  <div class="site-entrance-preference">
    <div>
      <strong>网站入场欢迎</strong>
      <span>开启屏蔽后，不再播放管理员设置的网站欢迎；你的自定义页面动效仍按个人设置优先播放。</span>
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
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
}

.site-entrance-preference > div {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.site-entrance-preference strong {
  color: #262626;
  font-size: 14px;
}

.site-entrance-preference span {
  color: #8c8c8c;
  font-size: 12px;
  line-height: 1.6;
}

:deep(.dark-theme) .site-entrance-preference {
  border-color: var(--console-border);
  background: var(--console-surface-muted);
}

:deep(.dark-theme) .site-entrance-preference strong {
  color: var(--console-text);
}

:deep(.dark-theme) .site-entrance-preference span {
  color: var(--console-text-secondary);
}

@media (max-width: 640px) {
  .site-entrance-preference {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
