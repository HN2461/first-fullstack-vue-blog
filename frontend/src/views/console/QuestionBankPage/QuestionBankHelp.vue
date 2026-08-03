<template>
  <a-popover trigger="click" placement="bottomRight" overlay-class-name="question-bank-help-popover">
    <template #content>
      <div class="question-bank-help-content">
        <strong>{{ config.title }}</strong>
        <ol>
          <li v-for="step in config.steps" :key="step">{{ step }}</li>
        </ol>
      </div>
    </template>
    <a-tooltip title="使用说明">
      <a-button
        :size="size"
        :type="buttonType"
        class="question-bank-help-trigger"
        aria-label="打开使用说明"
      >
        <template #icon><QuestionCircleOutlined /></template>
      </a-button>
    </a-tooltip>
  </a-popover>
</template>

<script setup>
import { computed } from 'vue'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { questionBankHelpTopics } from './questionBankHelp'

const props = defineProps({
  topic: { type: String, required: true },
  size: { type: String, default: 'middle' },
  buttonType: { type: String, default: 'default' }
})

const config = computed(() => questionBankHelpTopics[props.topic] || {
  title: '使用说明',
  steps: ['当前页面暂未配置操作说明。']
})
</script>

<style scoped>
.question-bank-help-trigger {
  flex: 0 0 auto;
  color: var(--console-text-secondary, #667085);
}

.question-bank-help-content {
  width: min(360px, calc(100vw - 64px));
  color: var(--console-text, #101828);
}

.question-bank-help-content > strong {
  display: block;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--console-border, #e5e7eb);
  font-size: 14px;
}

.question-bank-help-content ol {
  display: grid;
  gap: 8px;
  margin: 12px 0 0;
  padding-left: 20px;
}

.question-bank-help-content li {
  padding-left: 2px;
  color: var(--console-text-secondary, #667085);
  font-size: 13px;
  line-height: 1.65;
}
</style>
