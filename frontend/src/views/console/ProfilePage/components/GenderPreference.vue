<template>
  <a-form-item label="性别" name="gender">
    <a-select
      :value="modelValue"
      show-search
      option-filter-prop="label"
      placeholder="请选择性别"
      @update:value="$emit('update:modelValue', $event)"
    >
      <a-select-option value="unknown" label="未知">未知</a-select-option>
      <a-select-option value="male" label="男">男</a-select-option>
      <a-select-option value="female" label="女">女</a-select-option>
    </a-select>
  </a-form-item>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: 'unknown'
  }
})

defineEmits(['update:modelValue'])
</script>
