<template>
  <section class="birthday-preference">
    <div class="birthday-preference__date">
      <a-form-item label="出生日期" name="birthday">
        <a-input
          :value="birthday"
          type="date"
          :max="maxBirthday"
          placeholder="YYYY-MM-DD"
          @update:value="emit('update:birthday', $event)"
        />
      </a-form-item>
    </div>

    <div class="birthday-preference__mode">
      <a-form-item label="过生日方式">
        <a-segmented
          :value="birthdayCalendar"
          :options="calendarOptions"
          @change="emit('update:birthdayCalendar', $event)"
        />
      </a-form-item>
    </div>

    <div class="birthday-preference__effect">
      <a-form-item label="生日动画">
        <a-checkbox
          :checked="closeBirthEffect"
          @update:checked="emit('update:closeBirthEffect', $event)"
        >
          不再提醒生日动画
        </a-checkbox>
      </a-form-item>
    </div>
  </section>
</template>

<script setup>
defineProps({
  birthday: { type: String, default: '' },
  birthdayCalendar: { type: String, default: 'solar' },
  closeBirthEffect: { type: Boolean, default: false }
})

const emit = defineEmits([
  'update:birthday',
  'update:birthdayCalendar',
  'update:closeBirthEffect'
])

const calendarOptions = [
  { label: '阳历', value: 'solar' },
  { label: '农历', value: 'lunar' },
  { label: '都过', value: 'both' }
]

const today = new Date()
const maxBirthday = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0')
].join('-')
</script>

<style scoped>
.birthday-preference {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 0.72fr) minmax(150px, 0.72fr);
  gap: 24px;
  align-items: start;
}

.birthday-preference :deep(.ant-segmented) {
  width: 100%;
}

.birthday-preference :deep(.ant-segmented-group) {
  width: 100%;
}

.birthday-preference :deep(.ant-segmented-item) {
  flex: 1;
}

@media (max-width: 900px) {
  .birthday-preference {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
