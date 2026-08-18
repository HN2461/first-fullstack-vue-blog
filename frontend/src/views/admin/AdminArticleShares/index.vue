<template>
  <section class="article-shares-page">
    <BlogTable
      ref="tableRef"
      :api-fn="loadShares"
      :columns="columns"
      :params="tableParams"
      :page-size="15"
      :page-sizes="['15', '30', '50']"
      :scroll="{ x: 1120 }"
      :show-column-setting="true"
      empty-text="暂无共享阅读链接"
    >
      <template #toolbar>
        <div class="article-shares-toolbar">
          <div class="article-shares-toolbar__identity">
            <h2>共享阅读</h2>
            <a-tooltip title="分享链接无需访客登录；默认只读、不进入站内搜索，可设置提取码、有效期并随时撤销。">
              <QuestionCircleOutlined aria-label="查看共享阅读说明" />
            </a-tooltip>
          </div>
          <a-input-search v-model:value="keyword" allow-clear placeholder="搜索分享标题或说明" class="article-shares-toolbar__search" @search="reloadTable" />
          <a-select v-model:value="scopeType" allow-clear show-search option-filter-prop="label" placeholder="分享范围" :options="scopeOptions" class="article-shares-toolbar__select" />
          <a-button type="primary" @click="openCreate"><template #icon><PlusOutlined /></template>生成链接</a-button>
        </div>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'title'">
          <button class="article-share-title" type="button" @click="openDetail(record)">
            <strong>{{ record.title }}</strong>
            <span>{{ record.description || '暂无分享说明' }}</span>
          </button>
        </template>
        <template v-else-if="column.key === 'status'">
          <span class="article-share-status" :class="`is-${record.status}`"><i />{{ statusLabel(record.status) }}</span>
        </template>
        <template v-else-if="column.key === 'scopeType'">
          <span>{{ record.scopeType === 'category' ? `目录 · ${record.entryCount} 篇` : '单篇文章' }}</span>
        </template>
        <template v-else-if="column.key === 'mode'">
          <span class="article-share-mode"><LockOutlined v-if="record.mode === 'password'" /><GlobalOutlined v-else />{{ record.mode === 'password' ? '提取码' : '直接访问' }}</span>
        </template>
        <template v-else-if="column.key === 'expiresAt'">{{ record.expiresAt ? formatDate(record.expiresAt) : '永久有效' }}</template>
        <template v-else-if="column.key === 'stats'">{{ record.viewCount }} 浏览 · {{ record.accessCount }} 次授权</template>
        <template v-else-if="column.key === 'action'">
          <a-space size="small">
            <a-tooltip title="复制阅读链接"><a-button type="text" aria-label="复制阅读链接" @click="copyShareUrl(record)"><template #icon><CopyOutlined /></template></a-button></a-tooltip>
            <a-tooltip title="查看详情"><a-button type="text" aria-label="查看共享阅读详情" @click="openDetail(record)"><template #icon><EyeOutlined /></template></a-button></a-tooltip>
          </a-space>
        </template>
      </template>
    </BlogTable>

    <a-modal v-model:open="createVisible" title="生成共享阅读链接" width="620px" :confirm-loading="creating" ok-text="生成链接" @ok="createShare">
      <a-form layout="vertical" class="article-share-form">
        <a-form-item label="分享范围">
          <a-radio-group v-model:value="form.scopeType">
            <a-radio-button value="article">单篇文章</a-radio-button>
            <a-radio-button value="category">文章目录</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="form.scopeType === 'article'" label="选择文章" required>
          <a-select v-model:value="form.articleId" show-search option-filter-prop="label" :options="articleOptions" :loading="loadingSources" placeholder="搜索已发布文章" />
        </a-form-item>
        <template v-else>
          <a-form-item label="选择目录" required>
            <a-select v-model:value="form.categoryId" show-search option-filter-prop="label" :options="categoryOptions" :loading="loadingSources" placeholder="搜索文章目录" />
          </a-form-item>
          <a-form-item>
            <a-checkbox v-model:checked="form.includeDescendants">包含子目录中的文章</a-checkbox>
          </a-form-item>
        </template>
        <a-form-item label="分享标题">
          <a-input v-model:value="form.title" maxlength="120" show-count placeholder="留空则使用文章或目录名称" />
        </a-form-item>
        <a-form-item label="分享说明"><a-textarea v-model:value="form.description" :rows="3" maxlength="500" show-count /></a-form-item>
        <div class="article-share-form__grid">
          <a-form-item label="访问方式">
            <a-select v-model:value="form.mode" :options="modeOptions" />
          </a-form-item>
          <a-form-item label="有效期">
            <a-select v-model:value="form.expiryMode" :options="expiryOptions" />
          </a-form-item>
        </div>
        <a-form-item v-if="form.expiryMode === 'custom'" label="失效时间"><a-date-picker v-model:value="form.expiresAt" show-time format="YYYY-MM-DD HH:mm" style="width: 100%" /></a-form-item>
        <a-alert v-if="createdCode" type="success" show-icon message="链接已生成" description="请立即复制提取码；关闭弹窗后仍可查看链接，但不会再次自动显示提取码。" />
      </a-form>
    </a-modal>

    <a-drawer v-model:open="detailVisible" :width="drawerWidth" title="共享阅读详情" :body-style="{ padding: 0 }">
      <div v-if="detail" class="article-share-detail">
        <section class="article-share-detail__lead"><div><h3>{{ detail.title }}</h3><p>{{ detail.description || '暂无分享说明' }}</p></div><span class="article-share-status" :class="`is-${detail.status}`"><i />{{ statusLabel(detail.status) }}</span></section>
        <section class="article-share-detail__section">
          <h4>访客链接</h4>
          <div class="article-share-detail__url"><code>{{ shareUrl(detail) }}</code><a-button type="text" aria-label="复制访客链接" @click="copyShareUrl(detail)"><template #icon><CopyOutlined /></template></a-button><a-tooltip title="打开访客页面"><a-button type="text" aria-label="打开访客页面" @click="openPublicPage(detail)"><template #icon><ExportOutlined /></template></a-button></a-tooltip></div>
          <div v-if="detail.extractionCode" class="article-share-detail__code"><span>提取码</span><code>{{ detail.extractionCode }}</code><a-button type="text" aria-label="复制提取码" @click="copyText(detail.extractionCode, '提取码已复制')"><template #icon><CopyOutlined /></template></a-button></div>
        </section>
        <section class="article-share-detail__section"><h4>分享设置</h4><dl><div><dt>范围</dt><dd>{{ detail.scopeType === 'category' ? `目录快照 · ${detail.entryCount} 篇` : '单篇文章' }}</dd></div><div><dt>访问方式</dt><dd>{{ detail.mode === 'password' ? '提取码访问' : '直接访问' }}</dd></div><div><dt>有效期</dt><dd>{{ detail.expiresAt ? formatDate(detail.expiresAt) : '永久有效' }}</dd></div><div><dt>浏览次数</dt><dd>{{ detail.viewCount }} 次</dd></div></dl></section>
        <section class="article-share-detail__section"><div class="article-share-detail__section-head"><h4>文章清单</h4><span>{{ detail.entryCount }} 篇</span></div><div class="article-share-detail__entries"><div v-for="entry in detail.entries" :key="entry.articleId"><FileTextOutlined /><span>{{ entry.title }}</span></div></div></section>
        <footer class="article-share-detail__footer"><a-button v-if="detail.status === 'active'" danger @click="revokeShare(detail)"><template #icon><StopOutlined /></template>撤销链接</a-button></footer>
      </div>
    </a-drawer>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { CopyOutlined, EyeOutlined, ExportOutlined, FileTextOutlined, GlobalOutlined, LockOutlined, PlusOutlined, QuestionCircleOutlined, StopOutlined } from '@ant-design/icons-vue'
import BlogTable from '@/components/BlogTable.vue'
import { listAdminArticles, listAllAdminCategories } from '@/services/admin'
import { createAdminArticleShare, listAdminArticleShares, revokeAdminArticleShare } from '@/services/articleShare'
import './article-shares.css'

const tableRef = ref(null)
const route = useRoute()
const keyword = ref('')
const scopeType = ref(undefined)
const createVisible = ref(false)
const detailVisible = ref(false)
const detail = ref(null)
const creating = ref(false)
const loadingSources = ref(false)
const createdCode = ref('')
const articleOptions = ref([])
const categoryOptions = ref([])
const form = ref({ scopeType: 'article', articleId: undefined, categoryId: undefined, includeDescendants: false, title: '', description: '', mode: 'public', expiryMode: 'never', expiresAt: null })
const drawerWidth = computed(() => window.innerWidth <= 720 ? 'calc(100vw - 16px)' : 620)
const tableParams = computed(() => ({ keyword: keyword.value.trim() || undefined, scopeType: scopeType.value || undefined }))
const columns = [
  { title: '分享标题', key: 'title', width: 260, fixed: 'left' },
  { title: '状态', key: 'status', width: 110 },
  { title: '范围', key: 'scopeType', width: 150 },
  { title: '访问方式', key: 'mode', width: 125 },
  { title: '有效期', key: 'expiresAt', width: 180 },
  { title: '访问统计', key: 'stats', width: 160 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
  { title: '操作', key: 'action', width: 110, fixed: 'right', align: 'center' }
]
const scopeOptions = [{ label: '单篇文章', value: 'article' }, { label: '文章目录', value: 'category' }]
const modeOptions = [{ label: '直接访问', value: 'public' }, { label: '提取码访问', value: 'password' }]
const expiryOptions = [{ label: '永久有效', value: 'never' }, { label: '指定时间', value: 'custom' }]

async function loadShares(params) { return listAdminArticleShares(params) }
function reloadTable() { tableRef.value?.reload() }
function formatDate(value) { return value ? new Date(value).toLocaleString('zh-CN') : '' }
function statusLabel(value) { return value === 'revoked' ? '已撤销' : value === 'expired' ? '已过期' : '生效中' }
function shareUrl(record) { return new URL(record.sharePath, window.location.origin).toString() }
function openDetail(record) { detail.value = record; detailVisible.value = true }

async function openCreate() {
  form.value = { scopeType: 'article', articleId: undefined, categoryId: undefined, includeDescendants: false, title: '', description: '', mode: 'public', expiryMode: 'never', expiresAt: null }
  createdCode.value = ''
  createVisible.value = true
  if (articleOptions.value.length || categoryOptions.value.length) {
    if (route.query.articleId && articleOptions.value.some((item) => item.value === route.query.articleId)) {
      form.value.articleId = route.query.articleId
    }
    return
  }
  loadingSources.value = true
  try {
    const [articles, categories] = await Promise.all([listAdminArticles({ page: 1, pageSize: 500, status: 'published' }), listAllAdminCategories({ pageSize: 100 })])
    articleOptions.value = (articles.items || []).map((item) => ({ label: item.title, value: item.id }))
    categoryOptions.value = (categories || []).filter((item) => item.status === 'active' && !item.isSystem).map((item) => ({ label: item.name, value: item.id }))
    if (route.query.articleId && articleOptions.value.some((item) => item.value === route.query.articleId)) {
      form.value.articleId = route.query.articleId
    }
  } catch (error) { message.error(error.message || '分享来源加载失败') } finally { loadingSources.value = false }
}

onMounted(() => {
  if (route.query.articleId) openCreate()
})

async function createShare() {
  if (form.value.scopeType === 'article' && !form.value.articleId) return message.warning('请选择要分享的文章')
  if (form.value.scopeType === 'category' && !form.value.categoryId) return message.warning('请选择要分享的目录')
  if (form.value.expiryMode === 'custom' && (!form.value.expiresAt || form.value.expiresAt.isBefore(dayjs()))) return message.warning('请选择未来的失效时间')
  creating.value = true
  try {
    const result = await createAdminArticleShare({ ...form.value, expiresAt: form.value.expiryMode === 'custom' ? form.value.expiresAt.toISOString() : null })
    createdCode.value = result.extractionCode || ''
    detail.value = result
    detailVisible.value = true
    message.success('共享阅读链接已生成')
    tableRef.value?.refresh()
  } catch (error) { message.error(error.message || '共享阅读链接生成失败') } finally { creating.value = false }
}

async function copyShareUrl(record) { await copyText(shareUrl(record), '共享阅读链接已复制') }
async function copyText(value, successMessage) { try { await navigator.clipboard.writeText(value); message.success(successMessage) } catch { message.error('复制失败，请手动复制') } }
function openPublicPage(record) { window.open(shareUrl(record), '_blank', 'noopener,noreferrer') }
function revokeShare(record) {
  Modal.confirm({ title: '撤销共享阅读链接', content: `撤销后，持有「${record.title}」链接的访客将立即无法继续阅读。`, okText: '确认撤销', okType: 'danger', async onOk() { await revokeAdminArticleShare(record.id); message.success('共享阅读链接已撤销'); detailVisible.value = false; tableRef.value?.refresh() } })
}
</script>
