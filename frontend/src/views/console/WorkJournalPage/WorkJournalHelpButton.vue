<template>
  <a-tooltip :title="`查看${title}说明`">
    <a-button class="work-journal-help" type="text" :aria-label="`查看${title}说明`" @click="open = true">
      <template #icon><QuestionCircleOutlined /></template>
    </a-button>
  </a-tooltip>
  <a-modal
      v-model:open="open"
      :title="`${title}说明`"
      :width="680"
      :body-style="{ maxHeight: '64vh', overflow: 'hidden' }"
      wrap-class-name="work-journal-dialog"
      ok-text="知道了"
      :cancel-button-props="{ style: { display: 'none' } }"
      @ok="open = false"
    >
      <div class="work-journal-help__content">
        <p>{{ intro }}</p>
        <section v-for="section in sections" :key="section.heading" class="work-journal-help__section">
          <h3>{{ section.heading }}</h3>
          <ul>
            <li v-for="item in section.items" :key="item">{{ item }}</li>
          </ul>
        </section>
      </div>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'

defineProps({
  title: { type: String, required: true },
  intro: { type: String, required: true },
  sections: { type: Array, default: () => [] }
})

const open = ref(false)
</script>

<style scoped>
.work-journal-help {
  color: var(--console-text-secondary, #606266);
}

.work-journal-help__content {
  max-height: calc(64vh - 36px);
  overflow-y: auto;
  padding-right: 4px;
}

.work-journal-help__content > p {
  margin: 0 0 18px;
  color: var(--console-text-secondary, #606266);
  line-height: 1.7;
}

.work-journal-help__section + .work-journal-help__section {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--console-border, #ebeef5);
}

.work-journal-help__section h3 {
  margin: 0 0 8px;
  color: var(--console-text, #303133);
  font-size: 14px;
  font-weight: 600;
}

.work-journal-help__section ul {
  display: grid;
  gap: 7px;
  margin: 0;
  padding-left: 20px;
  color: var(--console-text-secondary, #606266);
  line-height: 1.65;
}
</style>
