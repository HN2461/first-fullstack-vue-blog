<template>
  <div class="entrance-settings">
    <div class="entrance-settings__head">
      <div>
        <strong>自定义页面动效</strong>
        <span>保存后会按选择页面自动播放，也可以先点预览看实际效果。</span>
      </div>
      <a-switch
        :checked="model.enabled"
        checked-children="开启"
        un-checked-children="关闭"
        @change="updateField('enabled', $event)"
      />
    </div>

    <div class="entrance-settings__tools">
      <a-segmented
        :value="activeCategory"
        :options="categoryOptions"
        @change="activeCategory = $event"
      />
      <a-button html-type="button" @click="previewEffect">
        <template #icon><EyeOutlined /></template>
        预览
      </a-button>
    </div>

    <div class="entrance-settings__grid">
      <button
        v-for="effect in activeEffects"
        :key="effect.key"
        type="button"
        class="entrance-effect-card"
        :class="{ active: model.effectKey === effect.key }"
        :style="{ '--effect-tone': effect.tone }"
        @click="updateField('effectKey', effect.key)"
      >
        <span class="entrance-effect-card__preview">
          <i></i>
          <i></i>
          <i></i>
        </span>
        <span>{{ effect.name }}</span>
      </button>
    </div>

    <a-row :gutter="[16, 12]" class="entrance-settings__form">
      <a-col :xs="24" :md="10">
        <a-form-item label="播放时长">
          <div class="entrance-duration">
            <a-slider
              class="entrance-duration__slider"
              :value="model.duration"
              :min="2"
              :max="8"
              :step="0.5"
              @change="updateField('duration', $event)"
            />
            <a-input-number
              :value="model.duration"
              :min="2"
              :max="8"
              :step="0.5"
              addon-after="秒"
              @change="updateField('duration', $event)"
            />
          </div>
        </a-form-item>
      </a-col>
      <a-col :xs="24" :md="14">
        <a-form-item label="触发页面">
          <a-checkbox-group
            :value="model.triggerPages"
            :options="ENTRANCE_TRIGGER_OPTIONS"
            @change="updateField('triggerPages', $event)"
          />
        </a-form-item>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { EyeOutlined } from '@ant-design/icons-vue'
import {
  DEFAULT_ENTRANCE_EFFECT,
  ENTRANCE_EFFECT_CATEGORIES,
  ENTRANCE_TRIGGER_OPTIONS,
  normalizeEntranceEffectConfig
} from '@/utils/entranceEffects/effectCatalog'

const props = defineProps({
  value: {
    type: Object,
    default: () => ({ ...DEFAULT_ENTRANCE_EFFECT })
  }
})
const emit = defineEmits(['update:value'])
const activeCategory = ref(ENTRANCE_EFFECT_CATEGORIES[0].key)

const model = computed(() => normalizeEntranceEffectConfig(props.value))
const categoryOptions = computed(() => ENTRANCE_EFFECT_CATEGORIES.map((category) => ({
  label: category.label,
  value: category.key
})))
const activeEffects = computed(() => {
  return ENTRANCE_EFFECT_CATEGORIES.find((category) => category.key === activeCategory.value)?.effects || []
})

function updateField(key, value) {
  emit('update:value', normalizeEntranceEffectConfig({
    ...model.value,
    [key]: value
  }))
}

function previewEffect() {
  window.dispatchEvent(new CustomEvent('entrance-effect-preview', {
    detail: {
      ...model.value,
      enabled: true
    }
  }))
}

watch(() => model.value.effectKey, (effectKey) => {
  const category = ENTRANCE_EFFECT_CATEGORIES.find((item) => (
    item.effects.some((effect) => effect.key === effectKey)
  ))
  if (category) {
    activeCategory.value = category.key
  }
}, { immediate: true })
</script>

<style scoped>
.entrance-settings {
  display: grid;
  gap: 16px;
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fafafa;
}

.entrance-settings__head,
.entrance-settings__tools {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.entrance-settings__head > div {
  display: grid;
  gap: 4px;
}

.entrance-settings__head strong {
  color: #262626;
  font-size: 14px;
}

.entrance-settings__head span {
  color: #8c8c8c;
  font-size: 12px;
  line-height: 1.6;
}

.entrance-settings__tools {
  align-items: flex-start;
}

.entrance-settings__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
  gap: 10px;
}

.entrance-effect-card {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 8px 10px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  color: #434343;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.entrance-effect-card:hover,
.entrance-effect-card.active {
  border-color: var(--effect-tone);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.entrance-effect-card.active {
  color: #1677ff;
  font-weight: 600;
}

.entrance-effect-card__preview {
  position: relative;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  overflow: hidden;
  background: color-mix(in srgb, var(--effect-tone) 22%, #f8fafc);
}

.entrance-effect-card__preview i {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--effect-tone);
}

.entrance-effect-card__preview i:nth-child(1) {
  left: 6px;
  top: 6px;
}

.entrance-effect-card__preview i:nth-child(2) {
  right: 5px;
  top: 11px;
  opacity: 0.72;
}

.entrance-effect-card__preview i:nth-child(3) {
  left: 12px;
  bottom: 5px;
  opacity: 0.5;
}

.entrance-settings__form {
  margin-top: 2px;
}

.entrance-duration {
  display: flex;
  align-items: center;
  gap: 12px;
}

.entrance-duration__slider {
  flex: 1;
  min-width: 110px;
}

.dark-theme .entrance-settings,
:global(.dark-theme) .entrance-settings {
  border-color: var(--console-border);
  background: var(--console-surface-muted);
}

.dark-theme .entrance-settings__head strong,
.dark-theme .entrance-effect-card,
:global(.dark-theme) .entrance-settings__head strong,
:global(.dark-theme) .entrance-effect-card {
  color: var(--console-text);
}

.dark-theme .entrance-settings__head span,
:global(.dark-theme) .entrance-settings__head span {
  color: var(--console-text-secondary);
}

.dark-theme .entrance-effect-card,
:global(.dark-theme) .entrance-effect-card {
  border-color: var(--console-border);
  background: var(--console-surface);
}

@media (max-width: 768px) {
  .entrance-settings__head,
  .entrance-settings__tools {
    align-items: stretch;
    flex-direction: column;
  }

  .entrance-settings__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .entrance-duration {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
