<template>
  <ol class="feedback-activity" aria-label="反馈沟通记录">
    <li v-for="event in events" :key="event.id" :class="['feedback-activity__entry', { 'is-reply': event.kind === 'reply' }]">
      <span class="feedback-activity__marker" aria-hidden="true">
        <MessageOutlined v-if="event.kind === 'reply'" />
        <CheckOutlined v-else-if="event.toStatus === 'completed'" />
        <ClockCircleOutlined v-else />
      </span>
      <div class="feedback-activity__body">
        <div class="feedback-activity__heading">
          <div class="feedback-activity__identity">
            <strong>{{ event.actor.username }}</strong>
            <span>{{
              event.kind === 'reply'
                ? '回复'
                : event.kind === 'created'
                  ? '提交了反馈'
                  : event.kind === 'reopen'
                    ? '重新打开了反馈'
                    : event.kind === 'withdraw'
                      ? '撤回了反馈'
                      : '更新了处理状态'
            }}</span>
          </div>
          <time :datetime="event.createdAt" :title="feedbackTime(event.createdAt)">{{ feedbackActivityTime(event.createdAt) }}</time>
        </div>
        <div v-if="event.fromStatus && event.fromStatus !== event.toStatus" class="feedback-activity__transition">
          <span>{{ getFeedbackStatus(event.fromStatus).label }}</span
          ><ArrowRightOutlined aria-hidden="true" />
          <a-tag :color="getFeedbackStatus(event.toStatus).color" :bordered="false">{{ getFeedbackStatus(event.toStatus).label }}</a-tag>
        </div>
        <p v-if="event.content" class="feedback-activity__text">{{ event.content }}</p>
        <FeedbackAttachments :attachments="event.attachments" />
      </div>
    </li>
  </ol>
</template>

<script setup>
import { ArrowRightOutlined, CheckOutlined, ClockCircleOutlined, MessageOutlined } from '@ant-design/icons-vue'
import { feedbackActivityTime, feedbackTime, getFeedbackStatus } from './feedbackMeta'
import FeedbackAttachments from './FeedbackAttachments.vue'

defineProps({ events: { type: Array, default: () => [] } })
</script>

<style scoped>
.feedback-activity {
  list-style: none;
  margin: 0;
  padding: 0;
}
.feedback-activity__entry {
  position: relative;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 12px;
  padding-bottom: 24px;
}
.feedback-activity__entry:not(:last-child)::before {
  position: absolute;
  top: 28px;
  bottom: 0;
  left: 13px;
  width: 1px;
  background: var(--console-border);
  content: '';
}
.feedback-activity__entry:last-child {
  padding-bottom: 0;
}
.feedback-activity__marker {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--console-border);
  border-radius: 50%;
  background: var(--console-surface);
  color: var(--console-text-secondary);
  font-size: 13px;
}
.is-reply .feedback-activity__marker {
  color: var(--console-primary);
  background: var(--console-primary-soft);
  border-color: transparent;
}
.feedback-activity__body {
  min-width: 0;
  padding-top: 2px;
}
.feedback-activity__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px 16px;
  line-height: 24px;
}
.feedback-activity__identity {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 10px;
  min-width: 0;
}
.feedback-activity__identity > strong {
  font-size: 14px;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.feedback-activity__identity > span,
.feedback-activity__heading > time {
  font-size: 12px;
  color: var(--console-text-secondary);
}
.feedback-activity__heading > time {
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.feedback-activity__transition {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  color: var(--console-text-secondary);
  font-size: 12px;
  line-height: 22px;
}
.feedback-activity__transition :deep(.ant-tag) {
  margin: 0;
}
.feedback-activity__text {
  margin: 8px 0 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 14px;
  line-height: 1.8;
}
@media (max-width: 600px) {
  .feedback-activity__entry {
    gap: 10px;
  }
  .feedback-activity__heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 0;
  }
}
</style>
