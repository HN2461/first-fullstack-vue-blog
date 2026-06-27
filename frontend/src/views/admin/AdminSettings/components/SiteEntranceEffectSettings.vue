<template>
  <div class="site-entrance-settings">
    <div class="site-entrance-settings__head">
      <div>
        <strong>网站入场欢迎</strong>
        <span>超级管理员统一配置的欢迎特效，用户个人动效开启时优先展示个人效果。</span>
      </div>
      <a-switch
        :checked="model.enabled"
        checked-children="开启"
        un-checked-children="关闭"
        @change="updateField('enabled', $event)"
      />
    </div>

    <a-row :gutter="[16, 12]">
      <a-col :xs="24" :md="12">
        <a-form-item label="欢迎样式">
          <a-select
            :value="model.effectKey"
            :options="SITE_ENTRANCE_EFFECT_OPTIONS"
            show-search
            option-filter-prop="label"
            @change="updateField('effectKey', $event)"
          />
        </a-form-item>
      </a-col>
      <a-col :xs="24" :md="12">
        <a-form-item label="播放时长">
          <a-input-number
            :value="model.duration"
            :min="2"
            :max="8"
            :step="0.5"
            addon-after="秒"
            class="site-entrance-settings__number"
            @change="updateField('duration', $event)"
          />
        </a-form-item>
      </a-col>
      <a-col :xs="24">
        <a-form-item label="欢迎语">
          <a-input
            :value="model.titleTemplate"
            :maxlength="80"
            show-count
            placeholder="欢迎 {username} 进入"
            @update:value="updateField('titleTemplate', $event)"
          />
        </a-form-item>
      </a-col>
      <a-col :xs="24">
        <a-form-item label="副标题">
          <a-input
            :value="model.subtitle"
            :maxlength="120"
            show-count
            placeholder="今晚的知识库已点亮"
            @update:value="updateField('subtitle', $event)"
          />
        </a-form-item>
      </a-col>
      <a-col :xs="24">
        <a-form-item label="触发页面">
          <a-checkbox-group
            :value="model.triggerPages"
            :options="ENTRANCE_TRIGGER_OPTIONS"
            @change="updateField('triggerPages', $event)"
          />
        </a-form-item>
      </a-col>
    </a-row>

    <div class="site-entrance-settings__footer">
      <span>欢迎语支持 {username} 和 {siteTitle}。</span>
      <a-button html-type="button" @click="preview">
        <template #icon><EyeOutlined /></template>
        预览网站欢迎
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { EyeOutlined } from '@ant-design/icons-vue'
import { ENTRANCE_TRIGGER_OPTIONS } from '@/utils/entranceEffects/effectCatalog'
import {
  DEFAULT_SITE_ENTRANCE_EFFECT,
  SITE_ENTRANCE_EFFECT_OPTIONS,
  normalizeSiteEntranceEffectConfig
} from '@/utils/entranceEffects/siteEntranceEffect'
import './SiteEntranceEffectSettings.css'

const props = defineProps({
  value: {
    type: Object,
    default: () => ({ ...DEFAULT_SITE_ENTRANCE_EFFECT })
  }
})
const emit = defineEmits(['update:value'])
const model = computed(() => normalizeSiteEntranceEffectConfig(props.value))

function updateField(key, value) {
  emit('update:value', normalizeSiteEntranceEffectConfig({
    ...model.value,
    [key]: value
  }))
}

function preview() {
  window.dispatchEvent(new CustomEvent('site-entrance-preview', {
    detail: {
      ...model.value,
      enabled: true
    }
  }))
}
</script>
