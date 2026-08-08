<template>
  <div class="article-author-preference">
    <div>
      <strong>显示文章作者栏</strong>
      <span>阅读文章时在底部操作栏展示作者头像、昵称和创作者标识，默认关闭。</span>
    </div>
    <a-switch
      :checked="modelValue"
      checked-children="开启"
      un-checked-children="关闭"
      @update:checked="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.article-author-preference {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 16px 0 20px;
  padding: 16px;
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface-muted);
}

.article-author-preference > div {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.article-author-preference strong {
  color: var(--console-text);
  font-size: 14px;
}

.article-author-preference span {
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .article-author-preference {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
