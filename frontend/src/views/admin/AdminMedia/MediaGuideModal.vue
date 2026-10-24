<template>
  <a-modal
    :open="open"
    :title="title"
    :footer="null"
    width="min(940px, calc(100vw - 32px))"
    wrap-class-name="media-guide-modal-wrap"
    :body-style="{ maxHeight: 'calc(100dvh - 180px)', overflow: 'hidden' }"
    @update:open="emit('update:open', $event)"
    @cancel="emit('update:open', false)"
  >
    <div class="media-guide">
      <div class="media-guide__tabs" role="tablist" aria-orientation="horizontal" aria-label="资源管理说明主题">
        <button
          v-for="item in topics"
          :key="item.key"
          type="button"
          role="tab"
          class="media-guide__tab"
          :data-topic="item.key"
          :class="{ 'is-active': activeTopic === item.key }"
          :aria-selected="activeTopic === item.key"
          :tabindex="activeTopic === item.key ? 0 : -1"
          @click="activeTopic = item.key"
          @keydown.left.prevent="moveTopic($event, -1)"
          @keydown.right.prevent="moveTopic($event, 1)"
        >
          {{ item.label }}
        </button>
      </div>

      <div class="media-guide__content" role="tabpanel">
      <template v-if="activeTopic === 'overview'">
        <section class="media-guide__lead">
          <strong>资源管理保存和整理网站文件，文章、头像等业务会引用其中的资源。</strong>
          <p>这里可以上传、搜索、预览、下载、分类和分享文件。资源能否彻底删除，还要看它有没有被文章或其他业务使用。</p>
        </section>
        <section class="media-guide__section">
          <h3>先看这几件事</h3>
          <dl class="media-guide__definitions">
            <div><dt>原始文件</dt><dd>上传的图片、文档或压缩包。预览和分类不会改写原始文件。</dd></div>
            <div><dt>资源记录</dt><dd>媒体库中显示的文件信息，包含文件名、分类、上传人、访问地址和业务引用情况。</dd></div>
            <div><dt>图片小图</dt><dd>只为图片生成的较小预览文件，帮助列表更快显示；它与原图分开存放，清理小图不会删除原图。</dd></div>
            <div><dt>回收站</dt><dd>普通删除会先移入回收站，文件仍保留。彻底删除才会移除原始文件，并先检查业务引用。</dd></div>
          </dl>
        </section>
        <section class="media-guide__section">
          <h3>可以从哪里开始</h3>
          <ul>
            <li>上传文件：查看“上传与传输”。</li>
            <li>找文件或查看大图：查看“搜索与预览”和“图片小图”。</li>
            <li>了解空间使用和释放空间：查看“占用统计”。</li>
            <li>删除被保护或被分享的资源：查看“引用与分享”。</li>
            <li>处理历史文件：查看“分类与未登记资源”或“回收站”。</li>
          </ul>
        </section>
      </template>

      <template v-else-if="activeTopic === 'browse'">
        <section class="media-guide__lead">
          <strong>列表视图适合筛选和批量管理；文件夹视图适合按分类浏览。</strong>
          <p>两种视图查看的是同一批媒体资源。切换视图不会复制、移动或删除文件。</p>
        </section>
        <section class="media-guide__section">
          <h3>搜索与浏览</h3>
          <ul>
            <li>列表视图可按文件名、分类、类型和引用状态筛选；适合核对资源信息和批量操作。</li>
            <li>文件夹视图按资源分类组织文件；搜索范围是当前打开的文件夹，返回根目录后可以搜索其他分类。</li>
            <li>分类是管理标签，不代表文件在硬盘上真的被移动到同名文件夹。</li>
            <li>点击预览可查看图片或受支持的文档；下载始终使用原始文件。</li>
          </ul>
        </section>
        <section class="media-guide__section">
          <h3>图片预览</h3>
          <p>列表中的小图用于快速扫看。打开预览时先显示小图；放大、选择 100% 或查看原始尺寸时，系统会再读取原图。原图加载完成后会叠在小图上，所以可能看到画面从模糊变清晰。</p>
          <p>预览、旋转和缩放只改变当前屏幕中的显示效果，不会编辑或覆盖原始图片。</p>
        </section>
      </template>

      <template v-else-if="activeTopic === 'images'">
        <section class="media-guide__lead">
          <strong>图片小图是为了列表预览额外生成的较小文件，不是原图的替代品。</strong>
          <p>它只影响图片预览；PDF、文档、压缩包等其他格式不会因此生成图片小图。</p>
        </section>
        <section class="media-guide__section">
          <h3>打开图片时会发生什么</h3>
          <ol>
            <li>列表需要显示图片时，服务器首次生成一张最长边不超过 640 像素的小图，并保存在专用缓存目录。</li>
            <li>同一条资源记录再次显示时会复用这张小图；不会每打开一次就多生成一份。</li>
            <li>预览弹框先用小图快速显示。用户放大或要求原始尺寸后，才加载原图；加载完成后原图覆盖小图显示。</li>
            <li>下载、分享和文章引用仍使用原始文件，不会把小图当成原图发送。</li>
          </ol>
        </section>
        <section class="media-guide__section">
          <h3>小图会不会自动消失</h3>
          <p>小图保存在服务器硬盘上，不会因为程序重启或进程结束自动清理。它不会长期占用运行内存，但会占用一部分磁盘空间。</p>
          <ul>
            <li>移入回收站时保留小图，方便恢复资源。</li>
            <li>资源彻底删除时，正常删除流程会一并清理对应小图。</li>
            <li>超级管理员可在“资源工具 → 缩略图缓存”查看和清理小图；清理后不影响原图，下次预览时会重新生成。</li>
          </ul>
        </section>
      </template>

      <template v-else-if="activeTopic === 'storage'">
        <section class="media-guide__lead">
          <strong>资源存储数字表示服务器硬盘文件占用，不是服务器运行内存。</strong>
          <p>数字会统计上传文件和相关缓存，所以原图和图片小图都会计入总量。</p>
        </section>
        <section class="media-guide__section">
          <h3>占用统计范围</h3>
          <dl class="media-guide__definitions">
            <div><dt>公开上传目录</dt><dd>普通媒体文件，以及图片预览小图等辅助文件。</dd></div>
            <div><dt>密码箱及私有资源</dt><dd>受密码箱或私有访问保护的文件。</dd></div>
            <div><dt>临时上传文件</dt><dd>尚未完成确认入库的分片上传数据；过期临时任务会由后台定期检查清理。</dd></div>
            <div><dt>运行内存</dt><dd>只有图片转换时会临时使用处理资源；生成后的小图存放在硬盘，不会一直留在运行内存。</dd></div>
          </dl>
        </section>
        <section class="media-guide__section">
          <h3>查看或释放图片小图空间</h3>
          <p>点击资源工具中的“缩略图缓存”，可以查看小图总数、占用空间、对应图片，以及找不到可用原图的小图数量。</p>
          <ul>
            <li>“清理孤儿小图”只清理找不到可用原图的小图，并清理超过 24 小时的生成临时残留。</li>
            <li>“清理全部小图”会移除现有图片预览小图和缓存临时文件，但不会删除任何原始资源或媒体记录。</li>
            <li>全部清理后，图片再次显示时会按需重新生成小图；第一次生成会多花一些处理时间。</li>
            <li>清理后刷新资源占用数字，可以确认磁盘占用变化。</li>
          </ul>
        </section>
      </template>

      <template v-else-if="activeTopic === 'references'">
        <section class="media-guide__lead">
          <strong>引用表示其他业务正在使用这份资源，是删除保护的重要依据。</strong>
          <p>资源管理负责展示引用来源；取消引用通常要回到引用它的文章、账号资料或分享记录中操作。</p>
        </section>
        <section class="media-guide__section">
          <h3>引用与删除</h3>
          <ul>
            <li>点击引用状态可以查看系统找到的使用位置。文章正文、封面、附件和账号头像等都可能引用媒体资源。</li>
            <li>被文章或账号资料使用的资源不能直接彻底删除；需要先在对应业务中替换或移除引用，再回来删除。</li>
            <li>移入回收站和彻底删除是两步操作。彻底删除会再次检查引用，避免只凭列表上的旧状态误删。</li>
            <li>不同业务的引用不能统一在资源管理页取消，否则可能让文章图片或账号资料变成失效地址。</li>
          </ul>
        </section>
        <section class="media-guide__section">
          <h3>资源分享</h3>
          <p>分享记录和文章引用不同。分享过期会停止访问，但不会自动删除分享记录；如果要解除分享对资源删除的保护，需要进入“资源分享管理”撤销对应分享。</p>
          <p>撤销分享只解除该分享关系，不会删除原文件；原文件仍受文章、头像等其他业务引用保护。</p>
        </section>
      </template>

      <template v-else-if="activeTopic === 'recovery'">
        <section class="media-guide__lead">
          <strong>回收站用于撤回误删；彻底删除才会真正清除服务器文件。</strong>
          <p>删除资源前先查看引用状态。被业务引用或被未撤销分享保护的资源，需要先处理相应关系。</p>
        </section>
        <section class="media-guide__section">
          <h3>删除分两步</h3>
          <dl class="media-guide__definitions">
            <div><dt>移入回收站</dt><dd>隐藏正常列表中的资源，但保留媒体记录、原始文件和图片小图；可以恢复。</dd></div>
            <div><dt>恢复资源</dt><dd>将回收站中的记录恢复到媒体库。原始文件和已有小图仍在。</dd></div>
            <div><dt>彻底删除</dt><dd>删除媒体记录和原始文件，并清理对应图片小图；操作不可通过本站回收站恢复。</dd></div>
            <div><dt>清空回收站</dt><dd>批量彻底删除其中符合条件的资源；后端会再次检查引用和分享保护。</dd></div>
          </dl>
        </section>
        <section class="media-guide__section">
          <h3>密码箱</h3>
          <p>密码箱资源受账号权限和单独的解锁状态保护。解锁有效期为固定 30 分钟，翻页或查看文件不会延长时间；缓存管理只对图片预览小图生效，不会绕过密码箱访问限制。</p>
        </section>
      </template>

      <template v-else-if="activeTopic === 'inventory'">
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

      <template v-else-if="activeTopic === 'upload'">
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
          <h3>批量下载文件命名</h3>
          <dl class="media-guide__definitions">
            <div><dt>媒体库名称</dt><dd>使用当前资源名称；如果压缩包内有重名文件，会自动追加序号。</dd></div>
            <div><dt>统一前缀 + 序号</dt><dd>给压缩包内的文件统一加前缀并编号，例如“项目截图-01.png”。</dd></div>
            <div><dt>仅序号</dt><dd>只使用编号和原文件扩展名，例如“01.png”“02.docx”。</dd></div>
          </dl>
          <p>这些选项只调整这次 ZIP 下载包内的文件名，不会修改媒体库名称、服务器文件或资源访问地址。</p>
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

      <template v-else-if="activeTopic === 'category'">
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
    </div>
  </a-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  topic: {
    type: String,
    default: 'overview',
    validator: (value) => ['overview', 'upload', 'browse', 'images', 'storage', 'references', 'category', 'inventory', 'recovery'].includes(value)
  }
})

const emit = defineEmits(['update:open'])
const topics = [
  { key: 'overview', label: '总览' },
  { key: 'upload', label: '上传与传输' },
  { key: 'browse', label: '搜索与预览' },
  { key: 'images', label: '图片小图' },
  { key: 'storage', label: '占用统计' },
  { key: 'references', label: '引用与分享' },
  { key: 'category', label: '分类' },
  { key: 'inventory', label: '未登记资源' },
  { key: 'recovery', label: '回收站' }
]
const activeTopic = ref(props.topic)
const title = computed(() => '资源管理使用指南')

watch(() => props.topic, (value) => {
  activeTopic.value = topics.some((item) => item.key === value) ? value : 'overview'
}, { immediate: true })

function moveTopic(event, direction) {
  const currentIndex = topics.findIndex((item) => item.key === activeTopic.value)
  const nextIndex = (currentIndex + direction + topics.length) % topics.length
  const nextTopic = topics[nextIndex]
  activeTopic.value = nextTopic.key
  event.currentTarget.parentElement?.querySelector(`[data-topic="${nextTopic.key}"]`)?.focus()
}
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
  grid-template-rows: auto minmax(0, 1fr);
  gap: 0;
  height: min(68vh, 680px, calc(100dvh - 180px));
  min-height: 0;
  overflow: hidden;
  color: var(--text-primary);
}

.media-guide__tabs {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 0 0 8px;
  border-bottom: 1px solid var(--border-color);
  scrollbar-width: thin;
}

.media-guide__tab {
  flex: 0 0 auto;
  min-height: 34px;
  padding: 0 10px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.media-guide__tab:hover,
.media-guide__tab:focus-visible {
  color: var(--console-primary-strong, #337ecc);
  background: var(--console-primary-soft, #ecf5ff);
  outline: none;
}

.media-guide__tab.is-active {
  color: var(--console-primary-strong, #337ecc);
  background: var(--console-primary-soft, #ecf5ff);
  font-weight: 600;
}

.media-guide__content {
  display: grid;
  align-content: start;
  gap: 18px;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 4px 4px 0;
  scrollbar-width: thin;
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

.media-guide__section ol {
  display: grid;
  gap: 6px;
  margin: 0;
  padding-left: 20px;
}

.media-guide__section ol li {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.7;
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
  .media-guide {
    height: min(72vh, 680px, calc(100dvh - 150px));
  }

  .media-guide__tab {
    padding-inline: 8px;
    font-size: 12px;
  }

  .media-guide__definitions > div {
    grid-template-columns: 1fr;
    gap: 2px;
  }
}
</style>
