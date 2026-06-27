<template>
  <teleport to="body">
    <div
      class="site-entrance"
      :class="[`site-entrance--${effectKey}`, { 'is-leaving': leaving }]"
      :style="effectStyle"
      role="status"
      aria-live="polite"
    >
      <canvas ref="canvasRef" class="site-entrance__canvas"></canvas>
      <div class="site-entrance__backdrop"></div>
      <div class="site-entrance__scan"></div>
      <div class="site-entrance__halo"></div>
      <div class="site-entrance__constellation" aria-hidden="true">
        <span
          v-for="item in constellation"
          :key="item.id"
          :style="item.style"
        ></span>
      </div>
      <section class="site-entrance__message">
        <span class="site-entrance__kicker">{{ effectLabel }}</span>
        <h2>{{ title }}</h2>
        <p v-if="subtitle">{{ subtitle }}</p>
      </section>
    </div>
  </teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { SITE_ENTRANCE_EFFECT_OPTIONS } from '@/utils/entranceEffects/siteEntranceEffect'
import './SiteEntranceWelcome.css'

const props = defineProps({
  effectKey: {
    type: String,
    default: 'confetti-fireworks'
  },
  title: {
    type: String,
    default: '欢迎进入'
  },
  subtitle: {
    type: String,
    default: ''
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

const canvasRef = ref(null)
let fire = null
let timers = []
let confettiApi = null

const effectLabel = computed(() => {
  return SITE_ENTRANCE_EFFECT_OPTIONS.find((option) => option.value === props.effectKey)?.label || '网站欢迎'
})
const effectStyle = computed(() => ({
  '--site-entrance-duration': `${props.duration}s`
}))
const constellation = computed(() => {
  const count = props.effectKey === 'golden-rain' ? 34 : 46
  return Array.from({ length: count }, (_item, index) => {
    const x = (index * 37) % 100
    const y = (index * 53) % 100
    const delay = ((index % 9) * 0.12).toFixed(2)
    const scale = (0.6 + (index % 5) * 0.16).toFixed(2)
    return {
      id: index,
      style: {
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}s`,
        transform: `scale(${scale})`
      }
    }
  })
})

function clearTimers() {
  timers.forEach((timer) => window.clearTimeout(timer))
  timers = []
}

function schedule(callback, delay) {
  const timer = window.setTimeout(callback, delay)
  timers.push(timer)
}

function getShape(text, scalar = 2) {
  if (typeof confettiApi?.shapeFromText === 'function') {
    return confettiApi.shapeFromText({ text, scalar })
  }
  return 'star'
}

function burst(options = {}) {
  fire?.({
    disableForReducedMotion: true,
    scalar: 1.05,
    ticks: 180,
    zIndex: 2147483647,
    ...options
  })
}

function playFireworks() {
  const star = getShape('✨', 2.2)
  const defaults = {
    spread: 72,
    startVelocity: 42,
    particleCount: 74,
    shapes: ['star', star],
    colors: ['#fff7ad', '#ff6b6b', '#4dd4ff', '#8cffb7', '#ff9f43']
  }
  burst({ ...defaults, origin: { x: 0.18, y: 0.72 }, angle: 58 })
  burst({ ...defaults, origin: { x: 0.82, y: 0.72 }, angle: 122 })
  schedule(() => burst({ ...defaults, particleCount: 96, origin: { x: 0.5, y: 0.38 }, spread: 104 }), 420)
  schedule(() => burst({ ...defaults, particleCount: 58, origin: { x: 0.32, y: 0.42 }, spread: 88 }), 850)
  schedule(() => burst({ ...defaults, particleCount: 58, origin: { x: 0.68, y: 0.42 }, spread: 88 }), 1080)
}

function playCyberBroadcast() {
  const diamond = getShape('◆', 1.9)
  const colors = ['#00f5ff', '#f8ff5a', '#ff2f92', '#ffffff']
  for (let index = 0; index < 5; index += 1) {
    schedule(() => {
      burst({
        particleCount: 34,
        spread: 46,
        startVelocity: 58,
        decay: 0.9,
        shapes: ['square', diamond],
        colors,
        origin: { x: 0.08, y: 0.36 + index * 0.08 },
        angle: 18
      })
      burst({
        particleCount: 34,
        spread: 46,
        startVelocity: 58,
        decay: 0.9,
        shapes: ['square', diamond],
        colors,
        origin: { x: 0.92, y: 0.36 + index * 0.08 },
        angle: 162
      })
    }, index * 180)
  }
}

function playStarGate() {
  const star = getShape('✦', 2)
  const colors = ['#dbeafe', '#7dd3fc', '#fef3c7', '#ffffff']
  for (let index = 0; index < 9; index += 1) {
    schedule(() => {
      burst({
        particleCount: 28,
        spread: 38,
        startVelocity: 22 + index * 2,
        gravity: 0.35,
        decay: 0.94,
        shapes: ['star', star],
        colors,
        origin: { x: 0.5 + Math.cos(index) * 0.16, y: 0.5 + Math.sin(index) * 0.1 }
      })
    }, index * 140)
  }
  schedule(() => burst({
    particleCount: 120,
    spread: 360,
    startVelocity: 34,
    gravity: 0.25,
    shapes: ['star', star],
    colors,
    origin: { x: 0.5, y: 0.5 }
  }), 760)
}

function playGoldenRain() {
  const coin = getShape('✦', 1.8)
  const colors = ['#fff7ad', '#ffd166', '#f59e0b', '#ffffff']
  for (let index = 0; index < 8; index += 1) {
    schedule(() => {
      burst({
        particleCount: 42,
        spread: 70,
        startVelocity: 24,
        gravity: 0.95,
        drift: index % 2 ? 0.35 : -0.35,
        shapes: ['square', coin],
        colors,
        origin: { x: 0.12 + index * 0.11, y: -0.04 }
      })
    }, index * 130)
  }
}

async function play() {
  clearTimers()
  await nextTick()
  if (!canvasRef.value) return
  if (!confettiApi) {
    confettiApi = (await import('canvas-confetti')).default
  }
  fire = confettiApi.create(canvasRef.value, {
    resize: true,
    useWorker: true
  })

  if (props.effectKey === 'cyber-broadcast') {
    playCyberBroadcast()
  } else if (props.effectKey === 'star-gate') {
    playStarGate()
  } else if (props.effectKey === 'golden-rain') {
    playGoldenRain()
  } else {
    playFireworks()
  }
}

watch(() => [props.effectKey, props.duration], () => {
  play()
}, { immediate: true })

onMounted(() => {
  play()
})

onBeforeUnmount(() => {
  clearTimers()
  fire?.reset?.()
  fire = null
})
</script>
