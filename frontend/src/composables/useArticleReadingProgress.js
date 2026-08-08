import { Modal } from 'ant-design-vue'
import { onBeforeUnmount, ref } from 'vue'
import {
  deleteArticleReadingProgress,
  getArticleReadingProgress,
  saveArticleReadingProgress
} from '@/services/readingProgress'
import {
  buildReadingSnapshot,
  captureReadingMetrics,
  getReadingProgressStorageKey,
  restoreReadingPosition,
  shouldSaveReadingProgress
} from '@/utils/readingProgress'

const SAVE_INTERVAL = 4000
const RESUME_MIN_PROGRESS = 5
const COMPLETED_PROGRESS = 95

function readLocalProgress(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null')
  } catch {
    return null
  }
}

function writeLocalProgress(key, progress) {
  try {
    localStorage.setItem(key, JSON.stringify(progress))
  } catch {
    // 浏览器禁用存储时继续保留当前会话内的进度，不阻断阅读。
  }
}

function removeLocalProgress(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // 清理失败不影响用户选择从头阅读。
  }
}

export function useArticleReadingProgress({ authStore, getScrollTarget }) {
  const progressPercent = ref(0)
  const active = ref(false)
  let currentArticle = null
  let storageKey = ''
  let scrollTarget = null
  let currentSnapshot = null
  let lastSavedSnapshot = null
  let saveTimer = null
  let pendingSave = null
  let hasScrolled = false
  let resumeModal = null
  let detachListeners = () => {}

  async function persist(force = false) {
    if (!active.value || !hasScrolled || !currentSnapshot || !currentArticle?.id) return

    const now = Date.now()
    if (!force && !shouldSaveReadingProgress(currentSnapshot, lastSavedSnapshot, now, SAVE_INTERVAL)) return

    const snapshot = { ...currentSnapshot }
    const articleId = currentArticle.id
    const key = storageKey
    lastSavedSnapshot = { ...snapshot, savedAt: now }
    writeLocalProgress(key, {
      ...snapshot,
      articleUpdatedAt: currentArticle.updatedAt || '',
      savedAt: now
    })

    if (!authStore.isLoggedIn) return

    const payload = {
      progressPercent: snapshot.progressPercent,
      scrollRatio: snapshot.scrollRatio,
      anchorSlug: snapshot.anchorSlug,
      anchorOffset: snapshot.anchorOffset
    }

    if (pendingSave) await pendingSave
    const request = saveArticleReadingProgress(articleId, payload).catch(() => null)
    pendingSave = request
    await request
    if (pendingSave === request) pendingSave = null
  }

  function scheduleSave() {
    if (saveTimer) return
    const wait = lastSavedSnapshot
      ? Math.max(0, SAVE_INTERVAL - (Date.now() - lastSavedSnapshot.savedAt))
      : 0
    saveTimer = window.setTimeout(async () => {
      saveTimer = null
      await persist()
    }, wait)
  }

  function handleScroll() {
    if (!active.value || !scrollTarget) return
    hasScrolled = true
    currentSnapshot = buildReadingSnapshot(captureReadingMetrics(scrollTarget))
    progressPercent.value = currentSnapshot.progressPercent
    scheduleSave()
  }

  function clearSaveTimer() {
    if (saveTimer) window.clearTimeout(saveTimer)
    saveTimer = null
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') void persist(true)
  }

  function handlePageHide() {
    void persist(true)
  }

  function attachListeners() {
    const eventTarget = scrollTarget === window ? window : scrollTarget
    eventTarget.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)
    detachListeners = () => {
      eventTarget.removeEventListener('scroll', handleScroll)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }

  async function clearProgress() {
    removeLocalProgress(storageKey)
    hasScrolled = false
    currentSnapshot = buildReadingSnapshot(captureReadingMetrics(scrollTarget))
    lastSavedSnapshot = { ...currentSnapshot, savedAt: Date.now() }
    progressPercent.value = currentSnapshot.progressPercent
    if (authStore.isLoggedIn && currentArticle?.id) {
      await deleteArticleReadingProgress(currentArticle.id).catch(() => null)
    }
  }

  async function start(article) {
    if (!article?.id) return

    detachListeners()
    clearSaveTimer()
    resumeModal?.destroy()
    resumeModal = null
    currentArticle = article
    storageKey = getReadingProgressStorageKey(
      article.id,
      authStore.user?.id || 'anonymous'
    )
    scrollTarget = getScrollTarget()
    if (!scrollTarget) return

    active.value = true
    hasScrolled = false
    currentSnapshot = buildReadingSnapshot(captureReadingMetrics(scrollTarget))
    lastSavedSnapshot = { ...currentSnapshot, savedAt: Date.now() }
    progressPercent.value = currentSnapshot.progressPercent
    attachListeners()

    let savedProgress = null
    if (authStore.isLoggedIn) {
      savedProgress = await getArticleReadingProgress(article.id).catch(() => null)
    }
    savedProgress = savedProgress || readLocalProgress(storageKey)

    if (
      !savedProgress ||
      Number(savedProgress.progressPercent) < RESUME_MIN_PROGRESS ||
      Number(savedProgress.progressPercent) >= COMPLETED_PROGRESS
    ) {
      return
    }

    const target = scrollTarget
    resumeModal = Modal.confirm({
      title: '继续阅读',
      content: `上次读到 ${Math.round(savedProgress.progressPercent)}%，是否继续？`,
      okText: '继续阅读',
      cancelText: '从头开始',
      onOk: () => {
        restoreReadingPosition(target, {
          ...savedProgress,
          currentArticleUpdatedAt: article.updatedAt
        })
      },
      onCancel: clearProgress
    })
  }

  function stop() {
    if (!active.value) return

    void persist(true)
    resumeModal?.destroy()
    resumeModal = null
    detachListeners()
    detachListeners = () => {}
    clearSaveTimer()
    active.value = false
    currentArticle = null
    scrollTarget = null
    currentSnapshot = null
    lastSavedSnapshot = null
    hasScrolled = false
  }

  onBeforeUnmount(stop)

  return {
    progressPercent,
    start,
    stop,
    persist
  }
}
