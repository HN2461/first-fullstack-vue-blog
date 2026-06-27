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
        :style="{ '--effect-tone': effect.tone, '--effect-accent': effect.accent }"
        @click="updateField('effectKey', effect.key)"
      >
        <span
          class="entrance-effect-card__preview"
          :class="`entrance-effect-card__preview--${effect.preview}`"
        >
          <i
            v-for="item in 4"
            :key="item"
          ></i>
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
import './EntranceEffectSettings.css'

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
