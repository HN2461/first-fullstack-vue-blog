<template>
  <span
    class="festival-icon"
    aria-hidden="true"
    v-html="iconSvg"
  ></span>
</template>

<script setup>
import { computed } from 'vue'
import { getFestivalIconSvg } from '@/utils/festival/festivalIconAssets'

const props = defineProps({
  icon: { type: String, required: true },
  festival: { type: Object, default: null }
})

// SVG 来自构建时导入的本地白名单，随 JS 内容哈希更新，避免固定资源地址残留旧图案。
const iconSvg = computed(() => getFestivalIconSvg(props.icon, props.festival))
</script>

<style scoped>
.festival-icon {
  display: block;
  /* 尺寸由使用场景传入，避免异步 CSS 的加载顺序覆盖列表尺寸。 */
  width: var(--festival-icon-size, 100%);
  height: var(--festival-icon-size, 100%);
  flex-shrink: 0;
  color: #263747;
  line-height: 0;
  user-select: none;
}

.festival-icon :deep(svg) {
  display: block;
}

.dark-theme .festival-icon {
  color: #a9c1d5;
}

.dark-theme .festival-icon :deep([stroke="#25689e"]) {
  stroke: #74b8ec;
}
</style>
