<template>
  <aside class="discussion-members">
    <div class="discussion-members__head">
      <strong>参与成员</strong>
      <a-tag :bordered="false">{{ members.length }} 人</a-tag>
    </div>
    <div class="discussion-members__list">
      <div v-for="member in members" :key="member.userId" class="discussion-members__item">
        <a-avatar :src="member.avatar || ''">{{ getInitial(member.username || member.email) }}</a-avatar>
        <span>
          <strong>{{ member.username || member.email || '成员' }}</strong>
          <small>{{ member.role === 'owner' ? '负责人' : '成员' }}</small>
        </span>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  members: {
    type: Array,
    default: () => []
  }
})

function getInitial(value = '') {
  return (value || 'U').slice(0, 1).toUpperCase()
}
</script>
