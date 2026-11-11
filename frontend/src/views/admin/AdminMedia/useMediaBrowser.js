import { computed, onScopeDispose, ref, watch } from 'vue'
import { listAdminMedia } from '@/services/admin'

/**
 * 管理资源浏览查询，切换筛选、视图或卸载后不让过时请求覆盖当前状态。
 * @param {object} props 当前工作区、视图及初始筛选。
 * @param {Function} request 分页资源请求，默认调用后台接口。
 * @returns {object} 查询、分页、加载结果与刷新方法。
 * @throws {Error} 请求异常转换成页面错误状态，保留重试能力。
 */
export function useMediaBrowser(props, request = listAdminMedia) {
  const filters = ref({
    keyword: '',
    categoryId: '',
    fileClass: '',
    usageStatus: '',
    scene: '',
    lifecycleStatus: '',
    ...props.initialFilters
  })
  const items = ref([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(20)
  const loading = ref(false)
  const error = ref('')
  let version = 0
  let tableVersion = 0
  let latestTableTask
  let disposed = false
  const query = computed(() => {
    const { categoryId, ...values } = filters.value
    return {
      ...Object.fromEntries(Object.entries(values).filter(([, value]) => value)),
      workspace: props.workspace,
      ...(categoryId ? (/^[a-f\d]{24}$/i.test(categoryId) ? { categoryId } : { category: categoryId }) : {})
    }
  })
  const requestKey = computed(() => JSON.stringify(query.value))

  function loadTable(params) {
    const key = requestKey.value
    const current = ++tableVersion
    loading.value = true
    error.value = ''
    const task = request({ ...query.value, ...params })
      .then((result) => {
        if (disposed || key !== requestKey.value || props.layout !== 'list') return { items: [], total: 0 }
        // BlogTable 接收每次 Promise 的返回值；旧翻页请求也返回最新结果，避免倒序完成覆盖当前页。
        if (current !== tableVersion) return latestTableTask !== task ? latestTableTask : { items: [], total: 0 }
        items.value = result.items
        return result
      })
      .catch((reason) => {
        if (!disposed && key === requestKey.value && props.layout === 'list') {
          if (current !== tableVersion && latestTableTask !== task) return latestTableTask
          error.value = reason.message || '资源加载失败'
        }
        return { items: [], total: 0 }
      })
      .finally(() => {
        if (!disposed && current === tableVersion && props.layout === 'list') loading.value = false
      })
    latestTableTask = task
    return task
  }

  async function loadGrid() {
    const current = ++version
    const key = requestKey.value
    loading.value = true
    error.value = ''
    items.value = []
    total.value = 0
    try {
      const result = await request({ ...query.value, page: page.value, pageSize: pageSize.value })
      if (disposed || current !== version || key !== requestKey.value || props.layout === 'list') return
      items.value = result.items
      total.value = result.total
    } catch (reason) {
      if (!disposed && current === version && key === requestKey.value) error.value = reason.message || '资源加载失败'
    } finally {
      if (!disposed && current === version) loading.value = false
    }
  }

  watch(
    () => [requestKey.value, props.layout],
    () => {
      version += 1
      tableVersion += 1
      page.value = 1
      error.value = ''
      if (props.layout !== 'list') loadGrid()
    },
    { immediate: true }
  )
  onScopeDispose(() => {
    disposed = true
    version += 1
    tableVersion += 1
  })
  return { filters, items, total, page, pageSize, loading, error, query, requestKey, loadTable, loadGrid }
}
