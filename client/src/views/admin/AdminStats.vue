<template>
  <section class="enterprise-page">
    <a-alert v-if="errorMessage" type="error" show-icon :message="errorMessage" />

    <div class="enterprise-page-header">
      <div>
        <p class="enterprise-page-kicker">WORKBENCH</p>
        <h2>知识库运营工作台</h2>
        <p>集中查看内容生产、互动审核、用户治理和系统配置状态。</p>
      </div>
      <div class="enterprise-page-toolbar">
        <a-button @click="$router.push('/console/articles')">查看知识库</a-button>
        <a-button type="primary" @click="$router.push('/console/manage/articles/new')">新建文章</a-button>
      </div>
    </div>

    <a-row :gutter="[16, 16]">
      <a-col v-for="item in statItems" :key="item.label" :xs="24" :sm="12" :xl="4">
        <a-card class="admin-metric-card" :bordered="false">
          <a-statistic :title="item.label" :value="item.value">
            <template #prefix>
              <component :is="item.icon" />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]" class="enterprise-section">
      <a-col :xs="24" :lg="14">
        <a-card class="admin-workbench-panel" title="待处理队列" :bordered="false">
          <a-list :data-source="queueItems">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :title="item.title" :description="item.description" />
                <a-tag :color="item.color">{{ item.value }}</a-tag>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="10">
        <a-card class="admin-workbench-panel" title="模块入口" :bordered="false">
          <a-space direction="vertical" class="full-width">
            <a-button block @click="$router.push('/console/manage/articles')">文章管理</a-button>
            <a-button block @click="$router.push('/console/manage/comments')">评论审核</a-button>
            <a-button block @click="$router.push('/console/manage/users')">用户管理</a-button>
            <a-button block @click="$router.push('/console/manage/media')">媒体资产</a-button>
            <a-button block @click="$router.push('/console/manage/settings')">系统设置</a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  FileDoneOutlined,
  FileTextOutlined,
  PictureOutlined,
  TeamOutlined,
  CommentOutlined,
  EditOutlined
} from '@ant-design/icons-vue'
import { getAdminStats } from '@/services/admin'

const stats = ref({})
const errorMessage = ref('')
const statItems = computed(() => [
  { label: '文章', value: stats.value.articleCount || 0, icon: FileTextOutlined },
  { label: '已发布', value: stats.value.publishedCount || 0, icon: FileDoneOutlined },
  { label: '草稿', value: stats.value.draftCount || 0, icon: EditOutlined },
  { label: '用户', value: stats.value.userCount || 0, icon: TeamOutlined },
  { label: '待审评论', value: stats.value.pendingCommentCount || 0, icon: CommentOutlined },
  { label: '媒体', value: stats.value.mediaCount || 0, icon: PictureOutlined }
])
const queueItems = computed(() => [
  {
    title: '草稿文章',
    description: '等待补充内容或发布确认',
    value: stats.value.draftCount || 0,
    color: 'gold'
  },
  {
    title: '待审评论',
    description: '需要管理员审核后公开展示',
    value: stats.value.pendingCommentCount || 0,
    color: 'red'
  },
  {
    title: '媒体素材',
    description: '已上传至本地媒体库的文件',
    value: stats.value.mediaCount || 0,
    color: 'blue'
  }
])

onMounted(async () => {
  try {
    stats.value = await getAdminStats()
  } catch (error) {
    errorMessage.value = error.message || '统计加载失败'
  }
})
</script>
