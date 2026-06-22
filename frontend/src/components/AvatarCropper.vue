<!--
  头像裁剪组件
  参考 scCropper，基于 cropperjs 实现
  支持 1:1 正方形裁剪、圆形预览、输出 File 对象
-->
<template>
  <div class="avatar-cropper">
    <div class="avatar-cropper__edit">
      <img :src="src" ref="imgRef" />
    </div>
    <div class="avatar-cropper__preview">
      <h4>图像预览</h4>
      <div class="avatar-cropper__preview__circle" ref="previewRef"></div>
      <p class="avatar-cropper__preview__tip">上传的图片将裁剪为正方形</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

const props = defineProps({
  /** 图片源（base64 或 URL） */
  src: { type: String, default: '' },
  /** 压缩质量 0-1 */
  compress: { type: Number, default: 0.9 },
  /** 裁剪宽高比，默认 1:1 */
  aspectRatio: { type: Number, default: 1 }
})

const imgRef = ref(null)
const previewRef = ref(null)
let cropperInstance = null

function initCropper() {
  if (!imgRef.value) return
  destroyCropper()
  cropperInstance = new Cropper(imgRef.value, {
    viewMode: 2,
    dragMode: 'move',
    responsive: false,
    aspectRatio: props.aspectRatio,
    preview: previewRef.value,
    autoCropArea: 1
  })
}

function destroyCropper() {
  if (cropperInstance) {
    cropperInstance.destroy()
    cropperInstance = null
  }
}

/** 获取裁剪后的 File 对象 */
function getCropFile(fileName = 'avatar.jpg', type = 'image/jpeg') {
  return new Promise((resolve) => {
    cropperInstance.getCroppedCanvas().toBlob((blob) => {
      resolve(new File([blob], fileName, { type }))
    }, type, props.compress)
  })
}

/** 获取裁剪后的 Blob */
function getCropBlob(type = 'image/jpeg') {
  return new Promise((resolve) => {
    cropperInstance.getCroppedCanvas().toBlob((blob) => {
      resolve(blob)
    }, type, props.compress)
  })
}

/** 获取裁剪后的 base64 */
function getCropData(type = 'image/jpeg') {
  return cropperInstance.getCroppedCanvas().toDataURL(type, props.compress)
}

watch(() => props.src, (val) => {
  if (val) {
    nextTick(() => initCropper())
  }
})

onMounted(() => {
  if (props.src) {
    nextTick(() => initCropper())
  }
})

onBeforeUnmount(() => {
  destroyCropper()
})

defineExpose({ getCropFile, getCropBlob, getCropData })
</script>

<style scoped>
.avatar-cropper {
  display: flex;
  align-items: stretch;
  gap: 16px;
  width: 100%;
  min-height: 320px;
  box-sizing: border-box;
}

.avatar-cropper__edit {
  flex: 1 1 0;
  min-width: 0;
  height: 320px;
  background: #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.avatar-cropper__edit img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-cropper__preview {
  flex: 0 0 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 18px 14px;
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  box-sizing: border-box;
}

.avatar-cropper__preview h4 {
  width: 100%;
  margin: 0 0 16px;
  font-weight: 600;
  font-size: 13px;
  color: #1f2937;
  text-align: center;
}

.avatar-cropper__preview__circle {
  position: relative;
  width: 120px;
  height: 120px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  border-radius: 50%;
  background: #f8fafc;
}

.avatar-cropper__preview__circle :deep(img) {
  max-width: none;
  max-height: none;
}

.avatar-cropper__preview__tip {
  margin: 12px 0 0;
  font-size: 12px;
  color: #8c8c8c;
  text-align: center;
}

:deep(.dark-theme) .avatar-cropper__edit,
:deep(.dark-theme) .avatar-cropper__preview,
:deep(.dark-theme) .avatar-cropper__preview__circle {
  border-color: var(--console-border);
  background: var(--console-surface-muted);
}

:deep(.dark-theme) .avatar-cropper__preview h4 {
  color: var(--console-text);
}

:deep(.dark-theme) .avatar-cropper__preview__tip {
  color: var(--console-text-secondary);
}

@media (max-width: 640px) {
  .avatar-cropper {
    flex-direction: column;
    min-height: auto;
  }

  .avatar-cropper__edit {
    width: 100%;
    height: 260px;
  }

  .avatar-cropper__preview {
    flex: 0 0 auto;
    width: 100%;
    flex-direction: row;
    gap: 12px;
  }

  .avatar-cropper__preview__circle {
    width: 80px;
    height: 80px;
  }
}
</style>
