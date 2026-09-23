<template>
  <section class="work-journal-empty" role="status">
    <div class="work-journal-empty__art" aria-hidden="true">
      <ClipboardList class="work-journal-empty__icon" :size="30" :stroke-width="1.7" />
    </div>
    <div class="work-journal-empty__copy">
      <strong>{{ title }}</strong>
      <span>{{ description }}</span>
    </div>
    <div v-if="$slots.default" class="work-journal-empty__actions">
      <slot />
    </div>
  </section>
</template>

<script setup>
import { ClipboardList } from 'lucide-vue-next'

defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true }
})
</script>

<style scoped>
.work-journal-empty {
  display: flex;
  width: 100%;
  min-height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  padding: 32px 24px;
}

.work-journal-empty__art {
  display: grid;
  width: 64px;
  height: 64px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--console-primary, #409eff) 16%, var(--console-border, #ebeef5));
  border-radius: 50%;
  color: var(--console-primary, #409eff);
  background: color-mix(in srgb, var(--console-primary, #409eff) 7%, var(--console-surface, #fff));
}

.work-journal-empty__icon {
  color: inherit;
}

.work-journal-empty__copy {
  display: grid;
  min-width: 0;
  justify-items: center;
  gap: 4px;
}

.work-journal-empty__copy strong {
  color: var(--console-text, #303133);
  font-size: 15px;
  font-weight: 600;
}

.work-journal-empty__copy span {
  max-width: 400px;
  color: var(--console-text-secondary, #606266);
  font-size: 13px;
  line-height: 1.7;
  text-align: center;
}

.work-journal-empty__actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 2px;
}

@media (max-width: 640px) {
  .work-journal-empty {
    min-height: 260px;
    padding: 24px 16px;
  }

  .work-journal-empty__copy {
    width: 100%;
  }

  .work-journal-empty__actions {
    width: 100%;
  }
}
</style>
