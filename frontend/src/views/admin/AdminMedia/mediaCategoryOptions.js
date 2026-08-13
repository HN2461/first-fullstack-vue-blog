function getUploaderId(record) {
  return record?.uploader?.id || record?.uploader || ''
}

export function getMovableMediaCategories(categories = [], records = [], currentUserId = '') {
  const containsForeignMedia = records.some((record) => {
    const uploaderId = getUploaderId(record)
    return uploaderId && String(uploaderId) !== String(currentUserId || '')
  })

  return containsForeignMedia ? categories.filter((item) => item.system) : categories
}
