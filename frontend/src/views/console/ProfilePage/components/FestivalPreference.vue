<template>
  <div class="festival-preference">
    <div>
      <strong>重大节日提醒</strong>
      <span>控制生日以外的重大节日庆祝弹框；节日氛围仍可在控制台顶部单独开关。</span>
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
.festival-preference {
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

.festival-preference > div {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.festival-preference strong {
  color: var(--console-text);
  font-size: 14px;
}

.festival-preference span {
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .festival-preference {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
