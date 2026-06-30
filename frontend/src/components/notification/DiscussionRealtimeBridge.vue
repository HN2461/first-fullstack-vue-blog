<template>
  <span class="discussion-realtime-bridge" aria-hidden="true" />
</template>

<script setup>
import { useDiscussionNotifications } from '@/composables/useDiscussionNotifications'

useDiscussionNotifications()
</script>

<style scoped>
.discussion-realtime-bridge {
  display: none;
}
</style>
