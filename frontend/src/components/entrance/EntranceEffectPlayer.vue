<template>
  <teleport to="body">
    <div
      class="entrance-effect"
      :class="[`entrance-effect--${effectKey}`, `entrance-effect--family-${effectFamily}`, { 'is-leaving': leaving }]"
      :style="effectStyle"
      aria-hidden="true"
    >
      <canvas
        v-if="usesCanvas"
        ref="canvasRef"
        class="entrance-effect__canvas"
      ></canvas>

      <template v-if="effectFamily === 'minimal'">
        <div class="entrance-effect__veil"></div>
        <div
          v-if="effectKey === 'flip-3d'"
          class="entrance-effect__page"
        ></div>
        <span
          v-for="item in minimalLines"
          :key="item.id"
          class="entrance-effect__line"
          :style="item.style"
        ></span>
      </template>

      <template v-else-if="effectFamily === 'particle'">
        <div class="entrance-effect__field"></div>
        <span
          v-for="item in particles"
          :key="item.id"
          class="entrance-effect__particle"
          :style="item.style"
        ></span>
      </template>

      <template v-else-if="effectFamily === 'ambient'">
        <div class="entrance-effect__atmosphere"></div>
        <div
          v-if="effectKey === 'curtain'"
          class="entrance-effect__curtain entrance-effect__curtain--top"
        ></div>
        <div
          v-if="effectKey === 'curtain'"
          class="entrance-effect__curtain entrance-effect__curtain--bottom"
        ></div>
        <span
          v-for="item in ambientElements"
          :key="item.id"
          class="entrance-effect__ambient-item"
          :style="item.style"
        ></span>
      </template>

      <template v-else-if="effectFamily === 'impact'">
        <div class="entrance-effect__impact-bg"></div>
        <span
          v-for="item in impactPieces"
          :key="item.id"
          class="entrance-effect__impact-piece"
          :style="item.style"
        ></span>
      </template>

      <template v-else>
        <div class="entrance-effect__soft-bg"></div>
        <span
          v-for="item in softElements"
          :key="item.id"
          class="entrance-effect__soft-item"
          :style="item.style"
        ></span>
      </template>
    </div>
  </teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { getEntranceEffectMeta } from '@/utils/entranceEffects/effectCatalog'
import { createEntranceCanvasScene } from '@/utils/entranceEffects/entranceCanvasScenes'
import {
  createAmbientItems,
  createImpactItems,
  createMinimalLines,
  createParticleItems,
  createSoftItems,
  getEntranceEffectFamily
} from '@/utils/entranceEffects/effectRenderers'
import './EntranceEffectPlayer.css'

const props = defineProps({
  effectKey: {
    type: String,
    default: 'fade-soft'
  },
  duration: {
    type: Number,
    default: 4
  },
  leaving: {
    type: Boolean,
    default: false
  }
})

const meta = computed(() => getEntranceEffectMeta(props.effectKey))
const effectFamily = computed(() => getEntranceEffectFamily(props.effectKey))
const canvasRef = ref(null)
let scene = null
const effectStyle = computed(() => ({
  '--entrance-duration': `${props.duration}s`,
  '--entrance-tone': meta.value.tone,
  '--entrance-accent': meta.value.accent || '#f7d774'
}))
const usesCanvas = computed(() => effectFamily.value !== 'minimal' && props.effectKey !== 'curtain' && props.effectKey !== 'flash-open')

const minimalLines = computed(() => createMinimalLines(props.effectKey))
const particles = computed(() => createParticleItems(props.effectKey))
const ambientElements = computed(() => createAmbientItems(props.effectKey))
const impactPieces = computed(() => createImpactItems(props.effectKey))
const softElements = computed(() => createSoftItems(props.effectKey))

function stopScene() {
  scene?.stop()
  scene = null
}

watch(() => [props.effectKey, props.duration, usesCanvas.value], async () => {
  stopScene()
  if (!usesCanvas.value) return
  await nextTick()
  if (!canvasRef.value) return
  scene = createEntranceCanvasScene(canvasRef.value, {
    effectKey: props.effectKey,
    duration: props.duration,
    tone: meta.value.tone,
    accent: meta.value.accent || '#f7d774'
  })
}, { immediate: true })

onBeforeUnmount(() => {
  stopScene()
})
</script>
