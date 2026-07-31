<template>
  <a-modal
    :open="open"
    :title="editingId ? '编辑公告' : '发布公告'"
    :confirm-loading="submitting"
    width="760px"
    :mask-closable="false"
    centered
    class="announce-form-modal"
    @cancel="$emit('close')"
    @update:open="handleOpenChange"
  >
    <template #footer>
      <a-button @click="$emit('close')">取消</a-button>
      <a-button :loading="submitting" @click="$emit('submit')">
        {{ editingId ? '保存修改' : '发布公告' }}
      </a-button>
      <a-button
        v-if="editingId"
        type="primary"
        :loading="repushing"
        @click="$emit('submit', { repush: true })"
      >
        保存并重新推送
      </a-button>
    </template>

    <a-form layout="vertical" class="announce-form">
      <a-form-item label="公告标题" required>
        <a-input
          v-model:value="form.title"
          placeholder="请输入公告标题"
          :maxlength="120"
          show-count
        />
      </a-form-item>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="公告级别">
            <a-select v-model:value="form.level">
              <a-select-option value="info">
                <span style="color: #1677ff">●</span> 功能更新
              </a-select-option>
              <a-select-option value="warning">
                <span style="color: #fa8c16">●</span> 重要提醒
              </a-select-option>
              <a-select-option value="error">
                <span style="color: #f5222d">●</span> 紧急高危
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="上下架状态">
            <a-switch
              v-model:checked="form.isActive"
              checked-children="上架"
              un-checked-children="下架"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="公告内容" required>
        <a-textarea
          v-model:value="form.content"
          placeholder="建议使用小标题和列表，例如：本次优化：&#10;- 第一项能力&#10;- 第二项体验"
          :rows="11"
          :maxlength="10000"
          show-count
        />
      </a-form-item>

      <a-form-item label="关联链接">
        <a-input
          v-model:value="form.link"
          placeholder="可选，点击公告后跳转的链接"
        />
      </a-form-item>

      <a-form-item label="弹窗推送">
        <a-switch
          v-model:checked="form.autoPopup"
          checked-children="开启"
          un-checked-children="关闭"
        />
        <div class="announce-form-hint">开启后，公告发布时将对所有在线用户弹窗提醒（仅首次）</div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
defineProps({
  open: {
    type: Boolean,
    default: false
  },
  editingId: {
    type: String,
    default: null
  },
  form: {
    type: Object,
    required: true
  },
  submitting: {
    type: Boolean,
    default: false
  },
  repushing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

function handleOpenChange(value) {
  if (!value) emit('close')
}
</script>
