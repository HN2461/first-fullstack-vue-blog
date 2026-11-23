<template>
  <a-modal :open="Boolean(article)" title="阅读范围与内容复核" :width="520"
    :body-style="{ maxHeight: '60vh', overflowY: 'auto' }" :confirm-loading="saving"
    :closable="!saving" :mask-closable="!saving" :keyboard="!saving" :cancel-button-props="{ disabled: saving }"
    ok-text="保存" cancel-text="取消" @ok="save" @cancel="emit('close')">
    <a-form layout="vertical" :disabled="saving">
      <a-form-item label="阅读范围" tooltip="修改文章受众不改变已有公开素材的独立访问范围。持有原链接的人仍可访问这些图片和附件。">
        <a-select v-model:value="form.audience" show-search option-filter-prop="label" :options="audiences" />
      </a-form-item>
      <a-form-item label="适用版本">
        <a-input v-model:value="form.applicableVersion" :maxlength="100" placeholder="如 Node.js 22 LTS" />
      </a-form-item>
      <a-form-item label="上次实际核验">
        <a-input v-model:value="form.verifiedOn" type="date" />
      </a-form-item>
      <a-form-item label="下次复核">
        <a-input v-model:value="form.nextReviewOn" type="date" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { updateArticleReview } from '@/services/admin'

const props = defineProps({ article: { type: Object, default: null } })
const emit = defineEmits(['close', 'saved'])
const saving = ref(false)
const form = reactive({ audience: 'members', applicableVersion: '', verifiedOn: '', nextReviewOn: '' })
const audiences = [{ value: 'members', label: '仅成员及受控分享' }, { value: 'public', label: '已发布时向访客公开' }]

watch(() => props.article, (article) => {
  if (!article) return
  Object.assign(form, {
    audience: article.audience || 'members',
    applicableVersion: article.applicableVersion || '',
    verifiedOn: article.verifiedOn || '',
    nextReviewOn: article.nextReviewOn || ''
  })
})

async function save() {
  if (!props.article || saving.value) return
  saving.value = true
  try {
    await updateArticleReview(props.article.id, { ...form, expectedUpdatedAt: props.article.updatedAt })
    emit('saved')
    message.success('阅读范围和复核设置已保存')
  } catch (error) {
    message.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>
