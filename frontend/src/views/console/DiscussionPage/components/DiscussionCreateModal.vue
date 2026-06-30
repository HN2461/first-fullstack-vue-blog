<template>
  <a-modal
    :open="open"
    title="新建讨论"
    :width="560"
    :confirm-loading="submitting"
    ok-text="创建"
    cancel-text="取消"
    destroy-on-close
    @ok="submit"
    @cancel="$emit('update:open', false)"
  >
    <div class="discussion-create-modal">
      <a-form layout="vertical">
        <a-form-item label="讨论类型">
          <a-segmented v-model:value="form.type" :options="typeOptions" />
        </a-form-item>
        <a-form-item v-if="form.type === 'group'" label="讨论名称">
          <a-input v-model:value.trim="form.title" :maxlength="80" placeholder="例如：接口设计讨论" />
        </a-form-item>
        <a-form-item label="参与成员" required>
          <a-select
            v-model:value="form.memberIds"
            mode="multiple"
            show-search
            option-filter-prop="label"
            :options="userOptions"
            :max-tag-count="4"
            :placeholder="form.type === 'direct' ? '选择 1 位成员' : `选择成员，最多 ${config.groupMemberLimit || 10} 人`"
            @search="handleSearch"
          />
        </a-form-item>
        <a-alert
          type="info"
          show-icon
          :message="`小组讨论最多 ${config.groupMemberLimit || 10} 人，讨论记录按用户配额自动保留。`"
        />
      </a-form>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  users: {
    type: Array,
    default: () => []
  },
  config: {
    type: Object,
    default: () => ({})
  },
  submitting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:open', 'search-users', 'submit'])

const typeOptions = [
  { label: '双人讨论', value: 'direct' },
  { label: '小组讨论', value: 'group' }
]
const form = reactive({
  type: 'direct',
  title: '',
  memberIds: []
})
const userOptions = computed(() => props.users.map((item) => ({
  label: `${item.username || item.email}（${item.email}）`,
  value: item.id
})))

function resetForm() {
  form.type = 'direct'
  form.title = ''
  form.memberIds = []
}

function handleSearch(keyword) {
  emit('search-users', keyword)
}

function submit() {
  if (form.type === 'direct' && form.memberIds.length !== 1) {
    message.warning('双人讨论请选择 1 位成员')
    return
  }
  if (form.type === 'group' && form.memberIds.length < 2) {
    message.warning('小组讨论至少再选择 2 位成员')
    return
  }
  emit('submit', {
    type: form.type,
    title: form.title,
    memberIds: [...form.memberIds]
  })
}

watch(() => props.open, (open) => {
  if (open) {
    resetForm()
    emit('search-users', '')
  }
})
</script>
