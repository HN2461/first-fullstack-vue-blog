<template>
  <a-modal
    :open="open"
    :title="title"
    :footer="null"
    width="760px"
    wrap-class-name="media-guide-modal-wrap"
    :body-style="{ maxHeight: 'calc(100dvh - 180px)', overflow: 'hidden' }"
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
            <div><dt>用户头像目录</dt><dd><code>avatars/</code> 中保存账号头像；未登记头像可由超级管理员补登记，仍被账号引用的头像禁止清理，无引用旧头像可单独清理。</dd></div>
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
            <li>未被业务引用的未登记文件可以补登记；被任何业务数据引用的文件既不能登记，也不能删除。</li>
            <li>已登记资源也使用同一条引用保护规则；软删除、永久删除和清空回收站前都会由后端再次校验引用。</li>
            <li>疑似测试文件清理与无引用旧头像清理是独立操作，后者只处理 avatars/ 下未登记且当前无业务引用的文件。</li>
            <li>简历照片、讨论附件和文章快照仍由各自业务流程维护，扫描页不提供普通登记或清理。</li>
          </ul>
        </section>
      </template>

      <template v-else-if="topic === 'upload'">
        <section class="media-guide__lead">
          <strong>确认文件清单后开始上传；关闭弹窗，任务仍会继续。</strong>
          <p>媒体资产用于上传、分类、查看、下载和整理资源。右上角的上传进度入口可随时查看任务结果。</p>
        </section>

        <section class="media-guide__section">
          <h3>上传操作与进度</h3>
          <dl class="media-guide__definitions">
            <div><dt>开始上传</dt><dd>先选择目标分类，再选择或拖入文件。上传前可移除文件或清空清单；文件数量、类型和大小以管理员配置及服务器校验为准。</dd></div>
            <div><dt>后台上传</dt><dd>点击“后台上传”或右上角关闭按钮，只隐藏弹窗；在当前浏览器标签页中切换页面仍可继续上传。控制台右上角显示实时进度，点击可重新打开清单。</dd></div>
            <div><dt>暂停与继续</dt><dd>暂停会停止当前传输并保留服务器已确认的部分。继续时从已确认位置恢复；网络波动会自动有限重试，重试失败后可手动继续。</dd></div>
            <div><dt>确认中与完成</dt><dd>字节发送完毕后还需要服务器确认入库。“确认中”不等于成功；全部资源入库后才显示 100%。最终清单会逐个显示完成或失败。</dd></div>
            <div><dt>部分失败</dt><dd>每个文件独立上传和入库。成功文件已在媒体库中；继续上传只处理未完成文件，不会重复上传已成功文件。</dd></div>
            <div><dt>取消上传</dt><dd>取消会停止后续任务并清理未完成的临时数据，已入库资源保留。正在确认入库的文件会先确认真实结果，再停止后续文件。</dd></div>
          </dl>
          <p>后台上传需要保持当前浏览器标签页打开。刷新、关闭标签页或退出登录会中断任务；不支持关闭浏览器后继续传输。密码箱上传需要保持密码箱验证有效。</p>
        </section>

        <section class="media-guide__section">
          <h3>小白释疑：上传到一半，服务器会多出垃圾文件吗？</h3>
          <p>已发送的内容可能已经到达服务器，并暂存在磁盘上，所以传输期间会占用空间。但未完成内容属于临时数据，不会作为完整资源出现在媒体库里。</p>
          <ul>
            <li>完整上传并校验、入库成功后，才成为正式资源。</li>
            <li>暂停、网络失败时保留已确认部分，以便继续上传；明确取消或移除未完成任务时，后端会尝试清理。</li>
            <li>服务启动及每小时检查过期临时数据，清理超过 24 小时未活动的任务，兜底处理断网、关页或进程崩溃留下的文件。</li>
            <li>临时占用无法完全避免；磁盘或权限异常可能使清理失败。系统还会限制并发和未完成总量，并检查磁盘安全余量。</li>
          </ul>
          <p>上传过程的临时数据与“文章正文临时图片”分类不同：后者已经是媒体库资源，需要按引用状态管理，不会被上传任务的过期清理删除。</p>
        </section>

        <section class="media-guide__section">
          <h3>下载任务与终止</h3>
          <ul>
            <li>点击下载后自动展开右上角圆圈中的下载中心；开始、排队和重复点击提示均在这里展示，短提示 2 秒后自动消失。收起面板或切换站内页面不影响任务。</li>
            <li>已知大小时，圆圈和面板显示实际百分比；服务器打包等未知大小的阶段显示转动状态与已接收容量，不会伪造百分比。列表逐个显示当前文件、全部排队文件和结束状态。</li>
            <li>同一任务尚未结束时重复点击只会显示“正在进行中，请勿重复点击”，不会重复请求；不同文件依次下载，避免争抢带宽。</li>
            <li>“终止”只停止对应文件，之后继续其他排队任务；“取消排队”不会发起该文件请求；“终止全部”同时停止当前文件和所有排队文件。</li>
            <li>下载完整接收后才交给浏览器保存。网站无法确认用户是否取消保存、浏览器是否拦截，或最终磁盘写入是否成功，请以浏览器下载列表为准；已经交给浏览器的文件需要在浏览器中取消。</li>
            <li>终止时会中断接收，未完成数据不触发文件保存；服务器单文件读取会随连接关闭停止，批量 ZIP 使用流式打包并在断开后中止，不额外生成临时下载包。浏览器缓存和内部临时存储由浏览器自行管理。</li>
          </ul>
        </section>

        <section class="media-guide__section">
          <h3>小白释疑：下载到一半，本地会留下半截文件吗？</h3>
          <p>可能会。浏览器或下载工具通常边接收边写入临时存储，例如 Chrome / Edge 使用 <code>.crdownload</code>，一些下载工具使用 <code>.part</code>。完成后才改为正式文件名。</p>
          <ul>
            <li>取消或失败后，有些工具会自动清理，有些会保留半截文件用于继续下载；浏览器崩溃后也可能残留。</li>
            <li>确认不再继续下载时，可以在下载工具中取消并删除，或手动删除对应临时文件。不要把半截文件当成完整文件使用。</li>
            <li>本页面的媒体下载会在完整接收后触发保存；接收失败会提示错误。浏览器内部临时存储由浏览器管理，网站不能替你扫描或删除本地下载目录。</li>
          </ul>
        </section>

        <section class="media-guide__section">
          <h3>资源整理与删除</h3>
          <p>分类帮助归档，引用详情用于判断资源是否被文章、头像等业务使用。移入回收站保留文件和记录；永久删除才会移除文件，并由后端校验引用保护。普通分类调整不改变资源内容；密码箱具有单独的访问保护。</p>
        </section>
      </template>

      <template v-else>
        <section class="media-guide__lead">
          <strong>普通资源分类用于检索和归档；密码箱分类还控制访问保护。</strong>
          <p>系统分类由业务流程共享使用；自定义分类只属于创建者，不会出现在其他账号的上传和迁移选项中。</p>
        </section>

        <section class="media-guide__section">
          <h3>系统分类</h3>
          <dl class="media-guide__definitions">
            <div><dt>默认素材</dt><dd>普通上传资源未指定分类时的默认归属。</dd></div>
            <div><dt>文章封面</dt><dd>文章列表和详情页封面字段使用的图片，不属于正文图片。</dd></div>
            <div><dt>文章正文图片</dt><dd>文章保存后仍被 Markdown 正文引用的图片；编辑器会在保存时将命中的临时图片自动转入该分类。</dd></div>
            <div><dt>文章正文临时图片</dt><dd>编辑器刚粘贴或插入、但尚未随文章保存绑定的图片；未使用的临时图片会保留，便于后续筛选清理。</dd></div>
            <div><dt>文章原始文档 / 快照原始文档</dt><dd>文章导入原始附件与导出快照保留的文档资源。</dd></div>
            <div><dt>历史未登记资源</dt><dd>通过扫描补登记的历史文件默认归属，便于后续整理。</dd></div>
          </dl>
        </section>

        <section class="media-guide__section">
          <h3>分类与引用状态</h3>
          <p>资源分类是归档标签；“已引用 / 疑似未引用”是系统扫描文章正文、封面、附件等位置后得到的实际使用状态。判断资源能否清理时，应以引用状态和引用详情为准。</p>
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
    validator: (value) => ['inventory', 'category', 'upload'].includes(value)
  }
})

const emit = defineEmits(['update:open'])
const title = computed(() => ({ category: '资源分类说明', inventory: '扫描未登记资源说明', upload: '资源管理与传输说明' }[props.topic]))
</script>

<style>
.media-guide-modal-wrap .ant-modal { top: 32px; max-width: calc(100vw - 32px); padding-bottom: 48px; }
@media (max-width: 600px) {
  .media-guide-modal-wrap .ant-modal { top: 16px; padding-bottom: 32px; }
}
</style>

<style scoped>
.media-guide {
  display: grid;
  gap: 18px;
  max-height: min(62vh, 560px, calc(100dvh - 180px));
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
