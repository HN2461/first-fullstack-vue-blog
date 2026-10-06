import { onMounted, reactive, ref } from 'vue'
import { getPublicHome } from '@/services/public'

/**
 * 读取公开门户使用的内容统计，避免认证页展示与站点实际数据脱节。
 * 请求失败时保留短横线，明确表示数据暂不可用，不用虚构的默认数字误导用户。
 */
export function usePublicHomeStats() {
  const stats = reactive({
    articleCount: null,
    categoryCount: null,
    tagCount: null
  })
  const loading = ref(false)

  async function loadStats() {
    loading.value = true
    try {
      const home = await getPublicHome()
      Object.assign(stats, {
        articleCount: Number.isFinite(home?.stats?.articleCount) ? home.stats.articleCount : null,
        categoryCount: Number.isFinite(home?.stats?.categoryCount) ? home.stats.categoryCount : null,
        tagCount: Number.isFinite(home?.stats?.tagCount) ? home.stats.tagCount : null
      })
    } catch {
      // 认证流程不依赖统计接口，公开统计失败时继续正常登录或注册。
    } finally {
      loading.value = false
    }
  }

  function formatStat(value) {
    return value === null ? '—' : value.toLocaleString()
  }

  onMounted(loadStats)

  return { stats, loading, formatStat, reload: loadStats }
}
