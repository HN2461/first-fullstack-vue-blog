<template>
  <div class="site-beian-links" :class="`site-beian-links--${tone}`">
    <span v-if="showCopyright" class="site-beian-links__copy">© 2026 Knowledge OS</span>
    <a
      class="site-beian-links__link"
      href="https://beian.miit.gov.cn/"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ icpBeianNumber }}
    </a>
    <a
      v-if="policeBeianNumber"
      class="site-beian-links__link site-beian-links__police"
      href="https://beian.mps.gov.cn/#/query/webSearch"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ policeBeianNumber }}
    </a>
  </div>
</template>

<script setup>
defineProps({
  showCopyright: {
    type: Boolean,
    default: false
  },
  tone: {
    type: String,
    default: 'default'
  }
})

const icpBeianNumber = '皖ICP备2026019318号-1'
// 公安联网备案审核通过后，再填写公安备案号并按平台给出的链接/图标补充展示。
const policeBeianNumber = ''
</script>

<style scoped>
.site-beian-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px 14px;
  min-width: 0;
  color: #667085;
  font-size: 12px;
  line-height: 1.6;
}

.site-beian-links__copy {
  color: inherit;
}

.site-beian-links__link {
  color: inherit;
  text-decoration: none;
}

.site-beian-links__link:hover {
  color: #1668dc;
}

.site-beian-links--auth {
  justify-content: flex-start;
  color: inherit;
}

.site-beian-links--auth-card {
  border-top: 1px solid var(--border-color);
  padding-top: 14px;
  color: var(--text-secondary);
}

@media (max-width: 760px) {
  .site-beian-links {
    gap: 6px 10px;
    text-align: center;
  }

  .site-beian-links--auth {
    justify-content: center;
  }
}
</style>
