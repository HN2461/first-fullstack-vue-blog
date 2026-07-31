<template>
  <div class="announcement-content">
    <template v-if="blocks.length">
      <template v-for="(block, index) in blocks" :key="`${block.type}-${index}`">
        <h4 v-if="block.type === 'heading'" class="announcement-content__heading">
          {{ block.content }}
        </h4>
        <ul v-else-if="block.type === 'list'" class="announcement-content__list">
          <li v-for="(item, itemIndex) in block.items" :key="`${index}-${itemIndex}`">
            <span>{{ item }}</span>
          </li>
        </ul>
        <p v-else class="announcement-content__paragraph">
          {{ block.content }}
        </p>
      </template>
    </template>
    <p v-else class="announcement-content__paragraph announcement-content__paragraph--empty">
      暂无公告内容
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { parseAnnouncementContent } from './announcementContent'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const blocks = computed(() => parseAnnouncementContent(props.content))
</script>

<style scoped>
.announcement-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--console-text, #101828);
  font-size: 14px;
  line-height: 1.75;
  word-break: break-word;
}

.announcement-content__heading {
  margin: 8px 0 0;
  color: var(--console-text, #101828);
  font-size: 14px;
  font-weight: 650;
  line-height: 1.5;
}

.announcement-content__heading:first-child {
  margin-top: 0;
}

.announcement-content__paragraph {
  margin: 0;
  color: var(--console-text, #101828);
}

.announcement-content__paragraph--empty {
  color: var(--console-text-secondary, #667085);
}

.announcement-content__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.announcement-content__list li {
  position: relative;
  padding: 9px 12px 9px 30px;
  border: 1px solid var(--console-border, #e5e7eb);
  border-radius: 6px;
  background: var(--console-surface-muted, #f8fafc);
}

.announcement-content__list li::before {
  content: '';
  position: absolute;
  left: 13px;
  top: 18px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--console-primary, #1677ff);
}

.announcement-content__list span {
  display: block;
}
</style>
