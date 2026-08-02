<template>
  <div v-if="activeSection === 'profile'" class="resume-form-grid">
    <div class="resume-photo-field">
      <div class="resume-photo-field__preview">
        <img v-if="profile.photoUrl" :src="profile.photoUrl" alt="当前证件照" />
        <UserOutlined v-else />
      </div>
      <div>
        <strong>证件照</strong>
        <p>用于网站预览及 Boss 模板导出，建议使用竖版免冠照片。</p>
        <a-upload :show-upload-list="false" :before-upload="beforePhotoUpload" :disabled="!resumeId || photoUploading" accept="image/jpeg">
          <a-button :loading="photoUploading" :disabled="!resumeId">
            <template #icon><UploadOutlined /></template>
            上传照片
          </a-button>
        </a-upload>
      </div>
    </div>
    <a-form-item label="姓名"><a-input v-model:value="profile.name" /></a-form-item>
    <a-form-item label="性别"><a-input v-model:value="profile.gender" /></a-form-item>
    <a-form-item label="年龄"><a-input v-model:value="profile.age" placeholder="例如：25岁" /></a-form-item>
    <a-form-item label="电话"><a-input v-model:value="profile.phone" /></a-form-item>
    <a-form-item label="邮箱"><a-input v-model:value="profile.email" /></a-form-item>
    <a-form-item label="所在地"><a-input v-model:value="profile.location" /></a-form-item>
    <a-form-item label="期望城市"><a-input v-model:value="profile.expectedCity" /></a-form-item>
    <a-form-item label="工作年限"><a-input v-model:value="profile.workYears" placeholder="例如：1年工作经验" /></a-form-item>
    <a-form-item label="照片地址"><a-input v-model:value="profile.photoUrl" placeholder="上传后自动填写，也可输入站内图片地址" /></a-form-item>
    <a-form-item label="个人链接"><a-input v-model:value="profile.website" /></a-form-item>
    <a-form-item label="补充简介">
      <a-textarea v-model:value="profile.summary" :auto-size="{ minRows: 3, maxRows: 8 }" />
    </a-form-item>
  </div>

  <div v-else class="resume-card-list">
    <article
      v-for="(item, index) in items"
      :key="item.id"
      class="resume-item-card"
      draggable="true"
      @dragstart="$emit('drag-start', index)"
      @dragover.prevent
      @drop="$emit('drop-item', index)"
    >
      <div class="resume-item-card__head">
        <strong>{{ sectionLabel }} #{{ index + 1 }}</strong>
        <div class="resume-action-row">
          <a-tooltip title="上移"><a-button size="small" @click="$emit('move-item', index, index - 1)"><template #icon><ArrowUpOutlined /></template></a-button></a-tooltip>
          <a-tooltip title="下移"><a-button size="small" @click="$emit('move-item', index, index + 1)"><template #icon><ArrowDownOutlined /></template></a-button></a-tooltip>
          <a-tooltip title="删除"><a-button size="small" danger @click="$emit('remove-item', index)"><template #icon><DeleteOutlined /></template></a-button></a-tooltip>
        </div>
      </div>

      <a-textarea
        v-if="activeSection === 'advantages' || activeSection === 'selfEvaluation'"
        v-model:value="item.content"
        :auto-size="{ minRows: 2, maxRows: 6 }"
      />

      <div v-else-if="activeSection === 'skills'" class="resume-form-grid">
        <a-form-item label="技能"><a-input v-model:value="item.name" /></a-form-item>
        <a-form-item label="熟练度"><a-input v-model:value="item.level" /></a-form-item>
        <a-form-item label="说明"><a-textarea v-model:value="item.description" :auto-size="{ minRows: 2, maxRows: 5 }" /></a-form-item>
      </div>

      <div v-else-if="activeSection === 'education'" class="resume-form-grid">
        <a-form-item label="学校"><a-input v-model:value="item.school" /></a-form-item>
        <a-form-item label="专业"><a-input v-model:value="item.major" /></a-form-item>
        <a-form-item label="学历"><a-input v-model:value="item.degree" /></a-form-item>
        <a-form-item label="开始时间"><a-input v-model:value="item.startDate" /></a-form-item>
        <a-form-item label="结束时间"><a-input v-model:value="item.endDate" /></a-form-item>
        <a-form-item label="说明"><a-textarea v-model:value="item.description" :auto-size="{ minRows: 2, maxRows: 5 }" /></a-form-item>
      </div>

      <div v-else-if="activeSection === 'workExperiences'" class="resume-card-list">
        <div class="resume-form-grid">
          <a-form-item label="公司"><a-input v-model:value="item.company" /></a-form-item>
          <a-form-item label="职位"><a-input v-model:value="item.role" /></a-form-item>
          <a-form-item label="开始时间"><a-input v-model:value="item.startDate" /></a-form-item>
          <a-form-item label="结束时间"><a-input v-model:value="item.endDate" /></a-form-item>
          <a-form-item label="工作说明"><a-textarea v-model:value="item.description" :auto-size="{ minRows: 2, maxRows: 5 }" /></a-form-item>
        </div>
        <ResumeHighlightEditor title="工作内容" :items="item.achievements" @add="$emit('add-highlight', item, 'achievements')" @remove="(highlightIndex) => $emit('remove-highlight', item, 'achievements', highlightIndex)" @link="(highlight) => $emit('link-highlight', 'workExperiences', item, highlight)" />
      </div>

      <div v-else-if="activeSection === 'projects'" class="resume-card-list">
        <div class="resume-form-grid">
          <a-form-item label="项目"><a-input v-model:value="item.name" /></a-form-item>
          <a-form-item label="角色"><a-input v-model:value="item.role" /></a-form-item>
          <a-form-item label="技术栈"><a-input v-model:value="item.techStack" /></a-form-item>
          <a-form-item label="开始时间"><a-input v-model:value="item.startDate" /></a-form-item>
          <a-form-item label="结束时间"><a-input v-model:value="item.endDate" /></a-form-item>
          <a-form-item label="项目背景"><a-textarea v-model:value="item.description" :auto-size="{ minRows: 2, maxRows: 6 }" /></a-form-item>
        </div>
        <ResumeHighlightEditor title="负责模块" show-title :items="item.highlights" @add="$emit('add-highlight', item, 'highlights')" @remove="(highlightIndex) => $emit('remove-highlight', item, 'highlights', highlightIndex)" @link="(highlight) => $emit('link-highlight', 'projects', item, highlight)" />
      </div>
    </article>
    <a-empty v-if="items.length === 0" description="暂无条目" />
  </div>
</template>

<script setup>
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons-vue'
import ResumeHighlightEditor from './ResumeHighlightEditor.vue'

defineProps({
  activeSection: { type: String, required: true },
  sectionLabel: { type: String, default: '' },
  profile: { type: Object, required: true },
  items: { type: Array, default: () => [] },
  resumeId: { type: String, default: '' },
  photoUploading: { type: Boolean, default: false }
})

const emit = defineEmits([
  'move-item',
  'remove-item',
  'drag-start',
  'drop-item',
  'add-highlight',
  'remove-highlight',
  'link-highlight',
  'upload-photo'
])

function beforePhotoUpload(file) {
  emit('upload-photo', file)
  return false
}
</script>
