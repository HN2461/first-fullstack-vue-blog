<template>
  <a-popover
    v-model:open="open"
    trigger="click"
    placement="bottomRight"
    overlay-class-name="festival-countdown-popover"
  >
    <button
      class="festival-countdown__trigger"
      type="button"
      aria-label="节日倒计时"
      title="节日倒计时"
      @mouseenter="open = true"
    >
      <CalendarOutlined />
    </button>

    <template #content>
      <section class="festival-countdown__panel">
        <header>
          <div>
            <strong>节日倒计时</strong>
            <span>{{ lunarSummary || '近 10 个节日' }}</span>
          </div>
          <a-tooltip title="预览最近节日氛围">
            <button type="button" @click="$emit('preview', schedule[0])">
              <EyeOutlined />
            </button>
          </a-tooltip>
        </header>

        <div class="festival-countdown__list">
          <button
            v-for="item in schedule"
            :key="`${item.key}-${item.date}`"
            class="festival-countdown__item"
            type="button"
            @click="$emit('preview', item)"
          >
            <span class="festival-countdown__icon">{{ item.icons?.[0] || '✨' }}</span>
            <span class="festival-countdown__body">
              <strong>{{ item.name }}</strong>
              <small>{{ item.source }} · {{ item.date }}</small>
            </span>
            <span class="festival-countdown__days">
              {{ item.daysUntil === 0 ? '今天' : `${item.daysUntil}天` }}
            </span>
          </button>
        </div>
      </section>
    </template>
  </a-popover>
</template>

<script setup>
import { ref } from 'vue'
import { CalendarOutlined, EyeOutlined } from '@ant-design/icons-vue'

defineProps({
  schedule: { type: Array, default: () => [] },
  lunarSummary: { type: String, default: '' }
})

defineEmits(['preview'])

const open = ref(false)
</script>

<style scoped>
.festival-countdown__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 40px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--console-menu-text, var(--console-text));
  cursor: pointer;
}

.festival-countdown__trigger:hover {
  border-color: transparent;
  background: var(--console-surface-hover);
  color: var(--console-primary-strong, var(--console-primary, #1677ff));
}

.festival-countdown__panel {
  width: min(340px, calc(100vw - 28px));
  max-height: min(520px, calc(100vh - 120px));
  overflow: hidden;
  background: var(--console-surface);
}

.festival-countdown__panel header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid var(--console-border);
}

.festival-countdown__panel header div {
  display: grid;
  gap: 2px;
}

.festival-countdown__panel header strong {
  color: var(--console-text);
  font-size: 14px;
}

.festival-countdown__panel header span {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.festival-countdown__panel header button {
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 8px;
  background: color-mix(in srgb, var(--console-primary, #1677ff) 10%, transparent);
  color: var(--console-primary, #1677ff);
  cursor: pointer;
}

.festival-countdown__list {
  display: grid;
  gap: 4px;
  max-height: 430px;
  padding: 8px 0 0;
  overflow-y: auto;
}

.festival-countdown__item {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--console-text);
  text-align: left;
  cursor: pointer;
}

.festival-countdown__item:hover {
  background: var(--console-hover, #f2f6fc);
}

.festival-countdown__icon {
  font-size: 18px;
}

.festival-countdown__body {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.festival-countdown__body strong,
.festival-countdown__body small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.festival-countdown__body strong {
  font-size: 13px;
}

.festival-countdown__body small {
  color: var(--console-text-secondary);
  font-size: 12px;
}

.festival-countdown__days {
  color: var(--console-primary, #1677ff);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

:global(.festival-countdown-popover .ant-popover-inner) {
  border: 1px solid var(--console-border);
  border-radius: 8px;
  background: var(--console-surface);
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.18);
}

:global(.festival-countdown-popover .ant-popover-inner-content) {
  padding: 0;
}
</style>
