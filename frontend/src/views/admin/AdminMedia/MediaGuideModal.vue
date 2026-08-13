<template>
  <a-modal
    :open="open"
    :title="title"
    :footer="null"
    width="760px"
    centered
    :body-style="{ maxHeight: '72vh', overflow: 'hidden' }"
    @update:open="emit('update:open', $event)"
    @cancel="emit('update:open', false)"
  >
    <div class="media-guide">
      <template v-if="topic === 'inventory'">
        <section class="media-guide__lead">
          <strong>扫描只用于核对“磁盘文件”和“媒体库记录”是否一致。</strong>
          <p>它不会自动删除文件，也不会改动文章、用户资料或系统设置中的既有引用。</p>
        </section>

        <section class="media-guide__section">
          <h3>扫描范围</h3>
          <p>系统只有一个上传存储根目录，头像、简历、讨论附件等只是在该根目录下按业务划分的子目录，不是多套存储。扫描会排除已经存在媒体库记录的资源，页面只展示相对路径，不展示服务器绝对目录。</p>
        </section>

        <section class="media-guide__section">
          <h3>来源标签</h3>
          <dl class="media-guide__definitions">
            <div><dt>用户头像目录</dt><dd><code>avatars/</code> 中保存账号头像，由个人资料模块独立管理。</dd></div>
            <div><dt>简历照片目录</dt><dd><code>resumes/</code> 中保存简历证件照或个人照片，由简历模块独立管理。</dd></div>
            <div><dt>讨论附件目录</dt><dd><code>discussions/</code> 中保存讨论图片和附件，由讨论模块独立管理。</dd></div>
            <div><dt>文章快照目录</dt><dd><code>article-snapshot/</code> 中保存文章权威快照原始文档，由快照流程独立管理。</dd></div>
            <div><dt>媒体上传目录</dt><dd><code>YYYY/MM/</code> 或 <code>media/</code> 是普通媒体位置，未登记文件可以补录到媒体库。</dd></div>
            <div><dt>测试目录</dt><dd>用于识别历史测试文件；确认未被引用后才可通过清理操作删除。</dd></div>
            <div><dt>其他上传目录</dt><dd>尚未纳入上述规则的历史或脚本写入文件，需要结合引用状态人工确认用途。</dd></div>
          </dl>
        </section>

        <section class="media-guide__section">
          <h3>登记与清理</h3>
          <ul>
            <li>登记会创建媒体库记录，不移动文件，也不改变已有文章、设置或用户引用。</li>
            <li>头像、简历照片、讨论附件和文章快照属于业务专用资源，只展示核对，列表禁选且后端拒绝登记。</li>
            <li>被业务引用的普通文件仍可登记，列表会标记引用数量和“清理受保护”。</li>
            <li>清理只面向疑似测试且未登记的文件；存在引用或业务专用目录资源会被后端再次拦截。</li>
          </ul>
        </section>
      </template>

      <template v-else>
        <section class="media-guide__lead">
          <strong>资源分类用于帮助媒体库检索和归档，不改变文件本身的访问地址。</strong>
          <p>系统分类由业务流程共享使用；自定义分类只属于创建者，不会出现在其他账号的上传和迁移选项中。</p>
        </section>

        <section class="media-guide__section">
          <h3>系统分类</h3>
          <dl class="media-guide__definitions">
            <div><dt>默认素材</dt><dd>普通上传资源未指定分类时的默认归属。</dd></div>
            <div><dt>文章封面</dt><dd>文章封面上传和管理使用的图片资源。</dd></div>
            <div><dt>文章正文图片 / 临时图片</dt><dd>文章编辑器中的正式图片与编辑过程产生的临时图片。</dd></div>
            <div><dt>文章原始文档 / 快照原始文档</dt><dd>文章导入原始附件与导出快照保留的文档资源。</dd></div>
            <div><dt>历史未登记资源</dt><dd>通过扫描补登记的历史文件默认归属，便于后续整理。</dd></div>
          </dl>
        </section>

        <section class="media-guide__section">
          <h3>自定义分类与账号边界</h3>
          <ul>
            <li>每个管理员可以新建、编辑或删除自己的自定义分类，用于项目截图、课程资料等业务归档。</li>
            <li>不同管理员可以创建同名分类；系统按创建者隔离分类及其资源，不会相互合并或串改。</li>
            <li>超级管理员可以查看全站资源，但不会取得其他管理员的私有分类；跨账号批量整理时只能迁移到系统分类。</li>
            <li>“待归档”表示历史媒体记录引用了尚未建立配置的分类名称，应先确认用途再决定是否新建同名分类。</li>
            <li>系统分类不能在此处编辑或删除，避免破坏文章、导入、快照等业务流程。</li>
          </ul>
        </section>
      </template>
    </div>
  </a-modal>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  topic: {
    type: String,
    default: 'inventory',
    validator: (value) => ['inventory', 'category'].includes(value)
  }
})

const emit = defineEmits(['update:open'])
const title = computed(() => props.topic === 'category' ? '资源分类说明' : '扫描未登记资源说明')
</script>

<style scoped>
.media-guide {
  display: grid;
  gap: 18px;
  max-height: min(62vh, 560px);
  overflow-y: auto;
  padding-right: 2px;
  color: var(--text-primary);
  scrollbar-width: none;
}

.media-guide::-webkit-scrollbar {
  display: none;
}

.media-guide__lead {
  display: grid;
  gap: 5px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.media-guide__lead strong,
.media-guide__section h3,
.media-guide__definitions dt {
  color: var(--text-primary);
  font-weight: 600;
}

.media-guide__lead strong {
  font-size: 15px;
}

.media-guide__lead p,
.media-guide__section p,
.media-guide__section li,
.media-guide__definitions dd {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.7;
}

.media-guide__section {
  display: grid;
  gap: 8px;
}

.media-guide__section h3 {
  margin: 0;
  font-size: 14px;
}

.media-guide__section ul {
  display: grid;
  gap: 6px;
  margin: 0;
  padding-left: 20px;
}

.media-guide__definitions {
  display: grid;
  gap: 8px;
  margin: 0;
}

.media-guide__definitions > div {
  display: grid;
  grid-template-columns: minmax(112px, 0.35fr) minmax(0, 1fr);
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.media-guide__definitions > div:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.media-guide__definitions dd {
  overflow-wrap: anywhere;
}

@media (max-width: 576px) {
  .media-guide__definitions > div {
    grid-template-columns: 1fr;
    gap: 2px;
  }
}
</style>
