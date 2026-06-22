<template>
  <div class="monitor-page">
    <section class="monitor-hero">
      <div>
        <p class="monitor-hero__eyebrow">运维观测</p>
        <h1>服务监控</h1>
        <p class="monitor-hero__desc">
          面向阿里云部署的日常巡检视图，集中查看 API、数据库、系统资源与近期请求健康情况。
        </p>
      </div>
      <div class="monitor-hero__actions">
        <div class="monitor-hero__stamp">
          <span>最近刷新</span>
          <strong>{{ formatDateTime(overview.generatedAt) }}</strong>
        </div>
        <div class="monitor-refresh-control">
          <span>自动刷新</span>
          <a-switch v-model:checked="autoRefresh" size="small" />
        </div>
        <a-select
          v-model:value="refreshIntervalMs"
          class="monitor-refresh-select"
          :disabled="!autoRefresh"
          :options="refreshIntervalOptions"
        />
        <a-button @click="showGlossary = true">
          <template #icon><QuestionCircleOutlined /></template>
          指标说明
        </a-button>
        <a-button :loading="loading" @click="loadOverview">
          <template #icon><ReloadOutlined /></template>
          立即刷新
        </a-button>
      </div>
    </section>

    <a-alert
      v-if="errorMessage"
      class="monitor-alert"
      type="error"
      show-icon
      :message="errorMessage"
    />

    <section class="monitor-kpis">
      <article class="monitor-kpi" v-for="item in kpis" :key="item.label">
        <div class="monitor-kpi__icon" :style="{ background: item.bg, color: item.color }">
          <component :is="item.icon" />
        </div>
        <div class="monitor-kpi__body">
          <span class="monitor-kpi__label">{{ item.label }}</span>
          <strong class="monitor-kpi__value">{{ item.value }}</strong>
          <span class="monitor-kpi__meta">{{ item.meta }}</span>
        </div>
        <a-tag :color="item.tagColor">{{ item.tagText }}</a-tag>
      </article>
    </section>

    <section class="monitor-grid">
      <article class="monitor-card monitor-card--wide">
        <header class="monitor-card__header">
          <div>
            <span class="monitor-card__eyebrow">基础资源</span>
            <h3>系统资源概览</h3>
          </div>
          <a-tag>{{ overview.system.hostname || '-' }}</a-tag>
        </header>

        <div class="resource-grid">
          <div class="resource-panel">
            <div class="resource-panel__top">
              <span class="monitor-label">
                CPU 使用率
                <a-tooltip :title="metricHelp.cpuUsage">
                  <QuestionCircleOutlined class="monitor-help-icon" />
                </a-tooltip>
              </span>
              <strong>{{ formatPercent(overview.system.cpu?.usagePercent) }}</strong>
            </div>
            <a-progress :percent="clampPercent(overview.system.cpu?.usagePercent)" :show-info="false" stroke-color="#1677ff" />
            <div class="resource-panel__meta">
              <span>{{ overview.system.cpu?.cores || 0 }} 核</span>
              <span class="monitor-inline-help">
                Load:
                {{ formatLoad(overview.system.cpu?.loadAverage) }}
                <a-tooltip :title="metricHelp.loadAverage">
                  <QuestionCircleOutlined class="monitor-help-icon" />
                </a-tooltip>
              </span>
            </div>
          </div>

          <div class="resource-panel">
            <div class="resource-panel__top">
              <span class="monitor-label">
                系统内存
                <a-tooltip :title="metricHelp.systemMemory">
                  <QuestionCircleOutlined class="monitor-help-icon" />
                </a-tooltip>
              </span>
              <strong>{{ formatPercent(overview.system.memory?.usagePercent) }}</strong>
            </div>
            <a-progress :percent="clampPercent(overview.system.memory?.usagePercent)" :show-info="false" stroke-color="#13c2c2" />
            <div class="resource-panel__meta">
              <span>{{ formatBytes(overview.system.memory?.used) }} / {{ formatBytes(overview.system.memory?.total) }}</span>
              <span>可用 {{ formatBytes(overview.system.memory?.free) }}</span>
            </div>
          </div>

          <div class="resource-panel">
            <div class="resource-panel__top">
              <span class="monitor-label">
                磁盘占用
                <a-tooltip :title="metricHelp.diskUsage">
                  <QuestionCircleOutlined class="monitor-help-icon" />
                </a-tooltip>
              </span>
              <strong>{{ formatPercent(overview.system.disk?.usagePercent) }}</strong>
            </div>
            <a-progress :percent="clampPercent(overview.system.disk?.usagePercent)" :show-info="false" stroke-color="#fa8c16" />
            <div class="resource-panel__meta">
              <span>{{ formatBytes(overview.system.disk?.used) }} / {{ formatBytes(overview.system.disk?.total) }}</span>
              <span>剩余 {{ formatBytes(overview.system.disk?.free) }}</span>
            </div>
          </div>

          <div class="resource-panel">
            <div class="resource-panel__top">
              <span class="monitor-label">
                Node 进程内存
                <a-tooltip :title="metricHelp.nodeMemory">
                  <QuestionCircleOutlined class="monitor-help-icon" />
                </a-tooltip>
              </span>
              <strong>{{ formatBytes(overview.system.nodeProcess?.heapUsed) }}</strong>
            </div>
            <a-progress :percent="nodeHeapPercent" :show-info="false" stroke-color="#722ed1" />
            <div class="resource-panel__meta">
              <span>Heap {{ formatBytes(overview.system.nodeProcess?.heapUsed) }} / {{ formatBytes(overview.system.nodeProcess?.heapTotal) }}</span>
              <span>RSS {{ formatBytes(overview.system.nodeProcess?.rss) }}</span>
            </div>
          </div>
        </div>
      </article>

      <article class="monitor-card">
        <header class="monitor-card__header">
          <div>
            <span class="monitor-card__eyebrow">运行状态</span>
            <h3>服务与运行环境</h3>
          </div>
        </header>

        <div class="detail-list">
          <div class="detail-row">
            <span>部署环境</span>
            <strong>{{ overview.system.environment || '-' }}</strong>
          </div>
          <div class="detail-row">
            <span>系统平台</span>
            <strong>{{ overview.system.platform || '-' }} / {{ overview.system.arch || '-' }}</strong>
          </div>
          <div class="detail-row">
            <span>Node 版本</span>
            <strong>{{ overview.system.nodeVersion || '-' }}</strong>
          </div>
          <div class="detail-row">
            <span>服务版本</span>
            <strong>{{ overview.system.serviceVersion || '-' }}</strong>
          </div>
          <div class="detail-row">
            <span>服务启动</span>
            <strong>{{ formatDateTime(overview.system.serviceStartedAt) }}</strong>
          </div>
          <div class="detail-row">
            <span>服务运行时长</span>
            <strong>{{ formatDuration(overview.system.uptimeSeconds) }}</strong>
          </div>
          <div class="detail-row">
            <span>服务器运行时长</span>
            <strong>{{ formatDuration(overview.system.systemUptimeSeconds) }}</strong>
          </div>
        </div>
      </article>

      <article class="monitor-card">
        <header class="monitor-card__header">
          <div>
            <span class="monitor-card__eyebrow">文件与存储</span>
            <h3>上传目录健康</h3>
          </div>
          <a-tag :color="statusColor(overview.storage.uploads?.status)">
            {{ storageStatusText(overview.storage.uploads?.status) }}
          </a-tag>
        </header>

        <div class="detail-list">
          <div class="detail-row">
            <span>目录</span>
            <strong>{{ overview.storage.uploads?.pathLabel || 'uploads' }}</strong>
          </div>
          <div class="detail-row">
            <span>是否存在</span>
            <strong>{{ overview.storage.uploads?.exists ? '是' : '否' }}</strong>
          </div>
          <div class="detail-row">
            <span>是否可写</span>
            <strong>{{ overview.storage.uploads?.writable ? '是' : '否' }}</strong>
          </div>
          <div class="detail-row">
            <span>目录大小</span>
            <strong>{{ formatBytes(overview.storage.uploads?.size) }}</strong>
          </div>
          <div class="detail-row detail-row--message">
            <span>状态说明</span>
            <strong>{{ overview.storage.uploads?.message || '-' }}</strong>
          </div>
        </div>
      </article>

      <article class="monitor-card">
        <header class="monitor-card__header">
          <div>
            <span class="monitor-card__eyebrow">近期请求</span>
            <h3>{{ requestWindowLabel }}</h3>
          </div>
        </header>

        <div class="request-metrics">
          <div class="request-metric">
            <span class="monitor-label">
              总请求
              <a-tooltip :title="metricHelp.totalRequests">
                <QuestionCircleOutlined class="monitor-help-icon" />
              </a-tooltip>
            </span>
            <strong>{{ overview.requests.totalRequests || 0 }}</strong>
          </div>
          <div class="request-metric">
            <span class="monitor-label">
              4xx
              <a-tooltip :title="metricHelp.status4xx">
                <QuestionCircleOutlined class="monitor-help-icon" />
              </a-tooltip>
            </span>
            <strong>{{ overview.requests.status4xx || 0 }}</strong>
          </div>
          <div class="request-metric">
            <span class="monitor-label">
              5xx
              <a-tooltip :title="metricHelp.status5xx">
                <QuestionCircleOutlined class="monitor-help-icon" />
              </a-tooltip>
            </span>
            <strong class="is-danger">{{ overview.requests.status5xx || 0 }}</strong>
          </div>
          <div class="request-metric">
            <span class="monitor-label">
              慢请求
              <a-tooltip :title="metricHelp.slowRequests">
                <QuestionCircleOutlined class="monitor-help-icon" />
              </a-tooltip>
            </span>
            <strong>{{ overview.requests.slowRequests || 0 }}</strong>
          </div>
          <div class="request-metric">
            <span class="monitor-label">
              平均响应
              <a-tooltip :title="metricHelp.avgResponse">
                <QuestionCircleOutlined class="monitor-help-icon" />
              </a-tooltip>
            </span>
            <strong>{{ formatMs(overview.requests.avgResponseMs) }}</strong>
          </div>
          <div class="request-metric">
            <span class="monitor-label">
              最近错误
              <a-tooltip :title="metricHelp.lastError">
                <QuestionCircleOutlined class="monitor-help-icon" />
              </a-tooltip>
            </span>
            <strong>{{ formatDateTime(overview.requests.lastErrorAt) }}</strong>
          </div>
        </div>
      </article>

      <article class="monitor-card monitor-card--wide">
        <header class="monitor-card__header">
          <div>
            <span class="monitor-card__eyebrow">告警中心</span>
            <h3>当前风险提示</h3>
          </div>
          <a-tag :color="alertsTagColor">{{ alertsTagText }}</a-tag>
        </header>

        <a-table
          size="small"
          row-key="key"
          class="monitor-inner-table"
          :columns="alertColumns"
          :data-source="alertRows"
          :pagination="false"
          :scroll="{ y: TABLE_SCROLL_Y }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'level'">
              <a-tag :color="alertLevelColor(record.level)">{{ alertLevelText(record.level) }}</a-tag>
            </template>
            <template v-else-if="column.key === 'content'">
              <div class="table-main-cell">
                <strong>{{ record.title }}</strong>
                <span>{{ record.description }}</span>
              </div>
            </template>
            <template v-else-if="column.key === 'suggestion'">
              <span class="table-muted-text">{{ record.suggestion || '-' }}</span>
            </template>
          </template>
          <template #emptyText>
            <a-empty description="当前没有风险告警" :image-style="{ height: '56px' }" />
          </template>
        </a-table>
      </article>

      <article class="monitor-card monitor-card--wide">
        <header class="monitor-card__header">
          <div>
            <span class="monitor-card__eyebrow">慢请求观察</span>
            <h3>最近慢请求明细</h3>
          </div>
          <a-tag color="orange">阈值 {{ formatMs(overview.requests.slowRequestThresholdMs) }}</a-tag>
        </header>

        <a-table
          size="small"
          row-key="rowKey"
          class="monitor-inner-table"
          :columns="slowRequestColumns"
          :data-source="slowRequestRows"
          :pagination="false"
          :scroll="{ x: 760, y: TABLE_SCROLL_Y }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'statusCode'">
              <a-tag :color="statusCodeColor(record.statusCode)">{{ record.statusCode }}</a-tag>
            </template>
            <template v-else-if="column.key === 'path'">
              <code class="table-path">{{ record.path }}</code>
            </template>
            <template v-else-if="column.key === 'durationMs'">
              <strong class="is-warning">{{ formatMs(record.durationMs) }}</strong>
            </template>
            <template v-else-if="column.key === 'timestamp'">
              {{ formatDateTime(record.timestamp) }}
            </template>
          </template>
          <template #emptyText>
            <a-empty description="最近没有慢请求" :image-style="{ height: '56px' }" />
          </template>
        </a-table>
      </article>

      <article class="monitor-card monitor-card--wide">
        <header class="monitor-card__header">
          <div>
            <span class="monitor-card__eyebrow">错误观察</span>
            <h3>最近 5xx 请求详情</h3>
          </div>
        </header>

        <a-table
          size="small"
          row-key="rowKey"
          class="monitor-inner-table"
          :columns="errorColumns"
          :data-source="errorRows"
          :pagination="false"
          :scroll="{ x: 980, y: TABLE_SCROLL_Y }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'statusCode'">
              <a-tag color="red">{{ record.statusCode }}</a-tag>
            </template>
            <template v-else-if="column.key === 'path'">
              <code class="table-path">{{ record.path }}</code>
            </template>
            <template v-else-if="column.key === 'durationMs'">
              {{ formatMs(record.durationMs) }}
            </template>
            <template v-else-if="column.key === 'timestamp'">
              {{ formatDateTime(record.timestamp) }}
            </template>
            <template v-else-if="column.key === 'action'">
              <a-button type="link" size="small" @click="copyTroubleshootingInfo(record)">
                复制排查信息
              </a-button>
            </template>
          </template>
          <template #emptyText>
            <a-empty description="最近没有 5xx 错误请求" :image-style="{ height: '56px' }" />
          </template>
        </a-table>
      </article>
    </section>

    <a-modal
      v-model:open="showGlossary"
      title="监控指标说明"
      width="860px"
      :footer="null"
      :body-style="{ maxHeight: '70vh', overflowY: 'auto', paddingTop: '16px' }"
    >
      <div class="glossary-grid">
        <section class="glossary-card" v-for="group in glossaryGroups" :key="group.title">
          <h3>{{ group.title }}</h3>
          <div class="glossary-list">
            <div class="glossary-item" v-for="item in group.items" :key="item.label">
              <div class="glossary-item__title">
                <strong>{{ item.label }}</strong>
                <span>{{ item.short }}</span>
              </div>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </section>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  ApiOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  HddOutlined,
  QuestionCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'
import { getAdminMonitorOverview } from '@/services/admin'

const REFRESH_INTERVAL_MS = 10000
const TABLE_SCROLL_Y = 260
const refreshIntervalOptions = [
  { label: '10 秒', value: 10000 },
  { label: '30 秒', value: 30000 },
  { label: '60 秒', value: 60000 }
]

const loading = ref(false)
const errorMessage = ref('')
const showGlossary = ref(false)
const autoRefresh = ref(true)
const refreshIntervalMs = ref(REFRESH_INTERVAL_MS)
const overview = ref({
  generatedAt: '',
  system: {
    hostname: '',
    environment: '',
    platform: '',
    arch: '',
    nodeVersion: '',
    serviceVersion: '',
    serviceStartedAt: '',
    uptimeSeconds: 0,
    systemUptimeSeconds: 0,
    cpu: {
      cores: 0,
      loadAverage: [],
      usagePercent: 0
    },
    memory: {
      total: 0,
      used: 0,
      free: 0,
      usagePercent: 0
    },
    disk: {
      total: 0,
      used: 0,
      free: 0,
      usagePercent: 0
    },
    nodeProcess: {
      rss: 0,
      heapTotal: 0,
      heapUsed: 0
    }
  },
  service: {
    api: {
      status: 'up',
      responseMs: 0
    },
    database: {
      status: 'down',
      responseMs: 0
    }
  },
  requests: {
    windowMinutes: 5,
    slowRequestThresholdMs: 1000,
    totalRequests: 0,
    status4xx: 0,
    status5xx: 0,
    slowRequests: 0,
    avgResponseMs: 0,
    lastErrorAt: null,
    recentErrors: [],
    recentSlowRequests: []
  },
  storage: {
    uploads: {
      status: 'down',
      exists: false,
      writable: false,
      size: 0,
      pathLabel: 'uploads',
      message: ''
    }
  },
  alerts: []
})

let timerId = null

const metricHelp = {
  cpuUsage: 'CPU 使用率表示最近一次采样区间内，CPU 花在非空闲状态上的占比。它是近似实时值，不是长期平均值。',
  loadAverage: 'Load Average 是 1/5/15 分钟平均负载。在 Linux/macOS 上更有参考价值；Node 官方文档说明 Windows 上该值固定为 [0, 0, 0]。',
  systemMemory: '系统内存来自 totalmem/freemem，表示整台服务器的总内存、已用内存和剩余可用内存。',
  diskUsage: '磁盘占用表示当前部署所在磁盘分区的已用/总量，用来判断日志、上传文件、备份是否快把盘打满。',
  nodeMemory: '这是后端 Node.js 程序自己的内存，不是整台服务器内存。heapUsed 是 JS 代码实际使用的堆内存，所以几十 MB 很常见；RSS 才是进程实际驻留内存。',
  totalRequests: '统计窗口内进入后端的全部请求数量，包括成功、客户端错误和服务端错误。',
  status4xx: '4xx 是客户端侧错误，如未登录、参数错误、找不到资源。多了说明前端请求、权限或调用方式需要检查。',
  status5xx: '5xx 是服务端错误，通常意味着后端异常、数据库异常或未处理错误，应优先关注。',
  slowRequests: '当前页面把响应时间超过 1000ms 的请求视为慢请求，用来快速发现接口变慢。',
  avgResponse: '平均响应时间是统计窗口内全部请求耗时的平均值，用来观察整体接口体验变化。',
  lastError: '最近错误时间记录最近一次 5xx 请求出现的时间，方便判断异常是否刚刚发生。'
}

const glossaryGroups = [
  {
    title: '服务状态',
    items: [
      {
        label: 'API 服务',
        short: '后端进程是否还在正常响应',
        description: '这项主要告诉你当前博客后端还活着没有。页面里展示的平均响应时间来自最近 5 分钟请求统计，不是单独再发一次探活请求。'
      },
      {
        label: 'MongoDB',
        short: '数据库连接与 ping 延迟',
        description: '系统会读取 Mongoose 当前连接状态，并执行数据库 ping。若状态不是 connected 或 ping 明显升高，通常说明数据库链路异常或负载变大。'
      },
      {
        label: '服务运行时长',
        short: '当前 Node 服务已经连续运行多久',
        description: '如果这个值经常很短，往往意味着服务频繁重启，需要结合 PM2、systemd 或容器日志继续排查。'
      }
    ]
  },
  {
    title: '系统资源',
    items: [
      {
        label: 'CPU 使用率',
        short: '一次采样区间内的忙碌比例',
        description: '这是根据两次 CPU 时间快照估算出的占比，更适合做巡检和异常趋势判断。如果长期高于 80% 到 90%，说明机器或服务负载偏高。'
      },
      {
        label: 'Load Average',
        short: '系统负载平均值',
        description: '它更像“等待运行或等待资源的任务压力”，在 Linux 上很有价值。Windows 下按 Node 官方文档该值固定为 [0, 0, 0]，所以本地开发时看到 0 属于正常现象。'
      },
      {
        label: '系统内存',
        short: '整机内存使用情况',
        description: '它反映的是服务器整体资源，而不是只有 Node 进程。若系统内存长期偏高，可能是数据库、日志进程、缓存或其他服务一起占用了内存。'
      },
      {
        label: 'Node 进程内存',
        short: '当前博客后端自己的内存占用',
        description: '它只统计当前 Node.js 后端进程，不代表整台服务器内存。页面主值显示 heapUsed，也就是 JS 堆里实际用了多少；几十 MB 属于常见正常值。RSS 是进程整体驻留内存，排查内存泄漏时两个值都要看。'
      },
      {
        label: '磁盘占用',
        short: '部署所在分区还剩多少空间',
        description: '你的博客会有上传文件、日志、备份等内容，这项很关键。空间过低会导致上传失败、日志写不进去，甚至数据库或系统异常。'
      }
    ]
  },
  {
    title: '请求统计',
    items: [
      {
        label: '总请求 / 4xx / 5xx',
        short: '最近 5 分钟内请求质量概览',
        description: '总请求帮助判断业务活跃度；4xx 更像调用或权限问题；5xx 才是后端需要优先排查的服务端故障。'
      },
      {
        label: '慢请求',
        short: '响应超过 1000ms 的请求数',
        description: '它能比 5xx 更早发现问题，因为很多系统在彻底报错前会先变慢。后续如果你愿意，也可以把 1000ms 做成后台可配置阈值。'
      },
      {
        label: '平均响应',
        short: '统计窗口内整体接口速度',
        description: '这个值适合观察整体体验是否变差，但会被少数极慢请求或大量超快请求拉动，所以最好结合慢请求数量一起看。'
      },
      {
        label: '最近错误',
        short: '最近一次 5xx 的发生时间',
        description: '如果这里显示刚刚出现错误，而告警也在增加，优先去看后端日志、数据库连接和最近部署变更。'
      }
    ]
  }
]

const alerts = computed(() => overview.value.alerts || [])
const recentErrors = computed(() => overview.value.requests?.recentErrors || [])
const recentSlowRequests = computed(() => overview.value.requests?.recentSlowRequests || [])
const alertColumns = [
  { title: '级别', key: 'level', width: 86 },
  { title: '告警内容', key: 'content', width: 280 },
  { title: '建议处理', key: 'suggestion' }
]
const slowRequestColumns = [
  { title: '状态', key: 'statusCode', width: 76 },
  { title: '方法', dataIndex: 'method', key: 'method', width: 72 },
  { title: '接口路径', key: 'path', width: 360 },
  { title: '耗时', key: 'durationMs', width: 100 },
  { title: '时间', key: 'timestamp', width: 180 }
]
const errorColumns = [
  { title: '状态', key: 'statusCode', width: 76 },
  { title: '方法', dataIndex: 'method', key: 'method', width: 72 },
  { title: '接口路径', key: 'path', width: 320 },
  { title: '请求 ID', dataIndex: 'requestId', key: 'requestId', width: 180 },
  { title: 'IP', dataIndex: 'ip', key: 'ip', width: 130 },
  { title: '用户', dataIndex: 'userId', key: 'userId', width: 180 },
  { title: '耗时', key: 'durationMs', width: 90 },
  { title: '时间', key: 'timestamp', width: 180 },
  { title: '操作', key: 'action', width: 110, fixed: 'right' }
]
const alertRows = computed(() => alerts.value.map((item, index) => ({
  ...item,
  key: `${item.level}-${item.title}-${index}`
})))
const slowRequestRows = computed(() => recentSlowRequests.value.map((item, index) => ({
  ...item,
  rowKey: item.requestId || `${item.timestamp}-${item.path}-${index}`
})))
const errorRows = computed(() => recentErrors.value.map((item, index) => ({
  ...item,
  rowKey: item.requestId || `${item.timestamp}-${item.path}-${index}`
})))
const requestWindowLabel = computed(() => `最近 ${overview.value.requests?.windowMinutes || 5} 分钟`)
const nodeHeapPercent = computed(() => {
  const used = Number(overview.value.system.nodeProcess?.heapUsed) || 0
  const total = Number(overview.value.system.nodeProcess?.heapTotal) || 0

  return clampPercent(total > 0 ? (used / total) * 100 : 0)
})
const alertsTagText = computed(() => alerts.value.length > 0 ? `${alerts.value.length} 条告警` : '运行平稳')
const alertsTagColor = computed(() => {
  if (alerts.value.some((item) => item.level === 'error')) return 'red'
  if (alerts.value.some((item) => item.level === 'warning')) return 'orange'
  return 'green'
})

const kpis = computed(() => [
  {
    label: 'API 服务',
    value: statusText(overview.value.service.api?.status),
    meta: `平均响应 ${formatMs(overview.value.requests.avgResponseMs)}`,
    icon: ApiOutlined,
    color: '#1677ff',
    bg: '#e6f4ff',
    tagColor: statusColor(overview.value.service.api?.status),
    tagText: overview.value.service.api?.status === 'up' ? '在线' : '异常'
  },
  {
    label: 'MongoDB',
    value: statusText(overview.value.service.database?.status),
    meta: `Ping ${formatMs(overview.value.service.database?.responseMs)}`,
    icon: DatabaseOutlined,
    color: '#13a04f',
    bg: '#ebfff2',
    tagColor: statusColor(overview.value.service.database?.status),
    tagText: dbReadyText(overview.value.service.database)
  },
  {
    label: '服务运行',
    value: formatDuration(overview.value.system.uptimeSeconds),
    meta: `启动于 ${formatDateTime(overview.value.system.serviceStartedAt)}`,
    icon: ClockCircleOutlined,
    color: '#722ed1',
    bg: '#f3ebff',
    tagColor: 'purple',
    tagText: overview.value.system.environment || '-'
  },
  {
    label: '磁盘剩余',
    value: formatBytes(overview.value.system.disk?.free),
    meta: `已用 ${formatPercent(overview.value.system.disk?.usagePercent)}`,
    icon: HddOutlined,
    color: '#fa8c16',
    bg: '#fff5e8',
    tagColor: clampPercent(overview.value.system.disk?.usagePercent) >= 80 ? 'orange' : 'green',
    tagText: `${Math.round(clampPercent(overview.value.system.disk?.usagePercent))}%`
  }
])

function clampPercent(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.max(0, Math.min(100, Math.round(number)))
}

function statusColor(status) {
  if (status === 'up') return 'green'
  if (status === 'degraded') return 'orange'
  return 'red'
}

function statusText(status) {
  return {
    up: '运行正常',
    degraded: '状态降级',
    down: '连接异常'
  }[status] || '未知状态'
}

function storageStatusText(status) {
  return {
    up: '可用',
    degraded: '需关注',
    down: '异常'
  }[status] || '未知'
}

function statusCodeColor(statusCode) {
  const code = Number(statusCode)
  if (code >= 500) return 'red'
  if (code >= 400) return 'orange'
  return 'green'
}

function alertLevelColor(level) {
  return {
    error: 'red',
    warning: 'orange',
    info: 'blue'
  }[level] || 'default'
}

function alertLevelText(level) {
  return {
    error: '严重',
    warning: '警告',
    info: '提示'
  }[level] || '未知'
}

function dbReadyText(database) {
  if (!database) return '未知'
  if (database.readyStateLabel) return database.readyStateLabel
  return database.status === 'up' ? '已连接' : '未连接'
}

function formatMs(value) {
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) return '0 ms'
  return `${Math.round(number)} ms`
}

function formatPercent(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '0%'
  return `${number.toFixed(number >= 10 ? 1 : 2).replace(/\.0$/, '')}%`
}

function formatBytes(value) {
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let current = number
  let unitIndex = 0

  while (current >= 1024 && unitIndex < units.length - 1) {
    current /= 1024
    unitIndex += 1
  }

  const precision = current >= 100 ? 0 : current >= 10 ? 1 : 2
  return `${current.toFixed(precision).replace(/\.0$/, '')} ${units[unitIndex]}`
}

function formatDuration(seconds) {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (days > 0) return `${days} 天 ${hours} 小时`
  if (hours > 0) return `${hours} 小时 ${minutes} 分钟`
  return `${minutes} 分钟`
}

function formatDateTime(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleString('zh-CN', {
    hour12: false
  })
}

function formatLoad(loadAverage) {
  if (overview.value.system.platform === 'win32') return 'Windows 不提供有效值'
  if (!Array.isArray(loadAverage) || loadAverage.length === 0) return '-'
  return loadAverage.map((item) => Number(item || 0).toFixed(2)).join(' / ')
}

async function loadOverview() {
  loading.value = true

  try {
    const data = await getAdminMonitorOverview()
    overview.value = data || overview.value
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = error.message || '监控数据加载失败'
  } finally {
    loading.value = false
  }
}

function startAutoRefresh() {
  stopAutoRefresh()

  if (autoRefresh.value) {
    timerId = window.setInterval(loadOverview, refreshIntervalMs.value)
  }
}

function stopAutoRefresh() {
  if (timerId) {
    window.clearInterval(timerId)
    timerId = null
  }
}

function buildTroubleshootingText(item) {
  return [
    `请求 ID：${item.requestId || '-'}`,
    `状态码：${item.statusCode || '-'}`,
    `方法：${item.method || '-'}`,
    `路径：${item.path || '-'}`,
    `耗时：${formatMs(item.durationMs)}`,
    `时间：${formatDateTime(item.timestamp)}`,
    `IP：${item.ip || '-'}`,
    `用户：${item.userId || '-'}`
  ].join('\n')
}

async function copyTroubleshootingInfo(item) {
  const text = buildTroubleshootingText(item)

  try {
    await navigator.clipboard.writeText(text)
    message.success('排查信息已复制')
  } catch {
    message.error('复制失败，请手动选择信息')
  }
}

onMounted(async () => {
  await loadOverview()
  startAutoRefresh()
})

onBeforeUnmount(() => {
  stopAutoRefresh()
})

watch([autoRefresh, refreshIntervalMs], startAutoRefresh)
</script>

<style scoped>
.monitor-page {
  max-width: 1440px;
  margin: 0 auto;
}

.monitor-hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 28px;
  margin-bottom: 20px;
  border: 1px solid rgba(22, 119, 255, 0.14);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(22, 119, 255, 0.08), rgba(19, 194, 194, 0.08)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 251, 255, 0.98));
}

.monitor-hero h1 {
  margin: 6px 0 10px;
  font-size: 24px;
  line-height: 1.2;
  color: #1f1f1f;
}

.monitor-hero__eyebrow,
.monitor-card__eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1677ff;
}

.monitor-hero__desc {
  max-width: 720px;
  margin: 0;
  color: #5f6b7a;
  line-height: 1.7;
}

.monitor-hero__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.monitor-hero__stamp {
  min-width: 180px;
  padding: 12px 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(22, 119, 255, 0.12);
}

.monitor-hero__stamp span {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #7a869a;
}

.monitor-hero__stamp strong {
  font-size: 14px;
  color: #1f1f1f;
}

.monitor-refresh-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #e8edf3;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.78);
  color: #5f6b7a;
  font-size: 13px;
}

.monitor-refresh-select {
  width: 92px;
}

.monitor-alert {
  margin-bottom: 16px;
}

.monitor-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.monitor-kpi,
.monitor-card {
  border: 1px solid #eef1f5;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.monitor-kpi {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
}

.monitor-kpi__icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.monitor-kpi__body {
  flex: 1;
  min-width: 0;
}

.monitor-kpi__label,
.resource-panel__meta,
.detail-row span,
.request-metric span {
  color: #7a869a;
}

.monitor-label,
.monitor-inline-help {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.monitor-help-icon {
  color: #94a3b8;
  cursor: help;
  transition: color 0.2s ease;
}

.monitor-help-icon:hover {
  color: #1677ff;
}

.monitor-kpi__label,
.monitor-kpi__meta {
  display: block;
  font-size: 12px;
}

.monitor-kpi__value {
  display: block;
  margin: 3px 0;
  font-size: 18px;
  color: #1f1f1f;
}

.monitor-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.monitor-card {
  padding: 20px;
}

.monitor-card--wide {
  grid-column: span 3;
}

.monitor-card__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.monitor-card__header h3 {
  margin: 4px 0 0;
  font-size: 17px;
  color: #1f1f1f;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.resource-panel {
  padding: 16px;
  border-radius: 8px;
  background: linear-gradient(180deg, #fbfcfe 0%, #ffffff 100%);
  border: 1px solid #eff3f8;
}

.resource-panel__top,
.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.resource-panel__top {
  margin-bottom: 10px;
}

.resource-panel__top strong {
  font-size: 18px;
  color: #1f1f1f;
}

.resource-panel__meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
  font-size: 12px;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  padding-bottom: 10px;
  border-bottom: 1px solid #f2f4f7;
}

.detail-row:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.detail-row strong {
  color: #1f1f1f;
  text-align: right;
}

.request-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.request-metric {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #eef1f5;
  background: #fafcff;
}

.request-metric span {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
}

.request-metric strong {
  font-size: 18px;
  color: #1f1f1f;
}

.request-metric strong.is-danger {
  color: #cf1322;
}

.table-main-cell strong {
  display: block;
  margin-bottom: 4px;
  color: #1f1f1f;
}

.table-main-cell span,
.table-muted-text {
  margin: 0;
  color: #5f6b7a;
  line-height: 1.6;
}

.monitor-inner-table {
  border: 1px solid #eef1f5;
  border-radius: 8px;
  overflow: hidden;
}

.monitor-inner-table :deep(.ant-table) {
  background: transparent;
}

.monitor-inner-table :deep(.ant-table-thead > tr > th) {
  background: #f7f9fc;
  color: #5f6b7a;
  font-weight: 600;
}

.monitor-inner-table :deep(.ant-table-cell) {
  vertical-align: top;
}

.table-path {
  display: inline-block;
  max-width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  background: #f6f8fb;
  color: #334155;
  white-space: normal;
  word-break: break-all;
  line-height: 1.5;
}

.is-warning {
  color: #d46b08;
}

.detail-row--message {
  align-items: flex-start;
}

.detail-row--message strong {
  max-width: 60%;
}

.glossary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.glossary-card {
  padding: 16px;
  border: 1px solid #eef1f5;
  border-radius: 8px;
  background: linear-gradient(180deg, #fbfcfe 0%, #ffffff 100%);
}

.glossary-card h3 {
  margin: 0 0 14px;
  font-size: 16px;
  color: #1f1f1f;
}

.glossary-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.glossary-item {
  padding-top: 14px;
  border-top: 1px solid #f0f3f7;
}

.glossary-item:first-child {
  padding-top: 0;
  border-top: none;
}

.glossary-item__title {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 6px;
}

.glossary-item__title strong {
  color: #1f1f1f;
}

.glossary-item__title span,
.glossary-item p {
  color: #5f6b7a;
}

.glossary-item p {
  margin: 0;
  line-height: 1.7;
}

@media (max-width: 1200px) {
  .monitor-kpis,
  .request-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .monitor-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .monitor-card--wide {
    grid-column: span 2;
  }
}

@media (max-width: 900px) {
  .monitor-hero,
  .monitor-hero__actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .resource-grid {
    grid-template-columns: 1fr;
  }

  .monitor-grid {
    grid-template-columns: 1fr;
  }

  .monitor-card--wide {
    grid-column: auto;
  }
}

@media (max-width: 640px) {
  .monitor-kpis,
  .request-metrics,
  .glossary-grid {
    grid-template-columns: 1fr;
  }

  .monitor-card,
  .monitor-kpi,
  .monitor-hero {
    padding-left: 16px;
    padding-right: 16px;
  }
}

:deep(.dark-theme) .monitor-hero {
  border-color: rgba(91, 143, 249, 0.22);
  background:
    linear-gradient(135deg, rgba(91, 143, 249, 0.14), rgba(19, 194, 194, 0.08)),
    linear-gradient(180deg, rgba(22, 31, 48, 0.95), rgba(17, 24, 39, 0.98));
}

:deep(.dark-theme) .monitor-hero h1,
:deep(.dark-theme) .monitor-hero__stamp strong,
:deep(.dark-theme) .monitor-kpi__value,
:deep(.dark-theme) .monitor-card__header h3,
:deep(.dark-theme) .resource-panel__top strong,
:deep(.dark-theme) .detail-row strong,
:deep(.dark-theme) .request-metric strong,
:deep(.dark-theme) .table-main-cell strong,
:deep(.dark-theme) .glossary-card h3,
:deep(.dark-theme) .glossary-item__title strong {
  color: #f8fafc;
}

:deep(.dark-theme) .monitor-hero__desc,
:deep(.dark-theme) .monitor-kpi__label,
:deep(.dark-theme) .monitor-kpi__meta,
:deep(.dark-theme) .resource-panel__meta,
:deep(.dark-theme) .detail-row span,
:deep(.dark-theme) .request-metric span,
:deep(.dark-theme) .table-main-cell span,
:deep(.dark-theme) .table-muted-text,
:deep(.dark-theme) .glossary-item__title span,
:deep(.dark-theme) .glossary-item p {
  color: #94a3b8;
}

:deep(.dark-theme) .monitor-hero__stamp,
:deep(.dark-theme) .monitor-refresh-control,
:deep(.dark-theme) .monitor-kpi,
:deep(.dark-theme) .monitor-card,
:deep(.dark-theme) .resource-panel,
:deep(.dark-theme) .request-metric,
:deep(.dark-theme) .monitor-inner-table,
:deep(.dark-theme) .glossary-card {
  border-color: rgba(148, 163, 184, 0.18);
  background: #111827;
  box-shadow: none;
}

:deep(.dark-theme) .detail-row,
:deep(.dark-theme) .glossary-item {
  border-color: rgba(148, 163, 184, 0.14);
}

:deep(.dark-theme) .monitor-inner-table :deep(.ant-table),
:deep(.dark-theme) .monitor-inner-table :deep(.ant-table-container),
:deep(.dark-theme) .monitor-inner-table :deep(.ant-table-body),
:deep(.dark-theme) .monitor-inner-table :deep(.ant-table-content) {
  background: #111827;
}

:deep(.dark-theme) .monitor-inner-table :deep(.ant-table-thead > tr > th) {
  background: #0f172a;
  color: #cbd5e1;
  border-color: rgba(148, 163, 184, 0.14);
}

:deep(.dark-theme) .monitor-inner-table :deep(.ant-table-tbody > tr > td) {
  color: #cbd5e1;
  border-color: rgba(148, 163, 184, 0.14);
}

:deep(.dark-theme) .monitor-inner-table :deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
  background: rgba(30, 41, 59, 0.88);
}

:deep(.dark-theme) .table-path {
  background: #0f172a;
  color: #cbd5e1;
}

:deep(.dark-theme) .is-warning {
  color: #fbbf24;
}
</style>
