import { z } from 'zod'

function removeSchemaDefault(schema) {
  let current = schema
  while (current instanceof z.ZodDefault) {
    current = current.unwrap()
  }
  return current
}

export function partialObjectSchema(schema) {
  const shapeWithoutDefaults = Object.fromEntries(
    Object.entries(schema.shape).map(([key, fieldSchema]) => [key, removeSchemaDefault(fieldSchema)])
  )

  // Zod 4 会在 partial 更新结构中应用字段默认值，因此先剥离默认值以保留未提交字段。
  return schema.safeExtend(shapeWithoutDefaults).partial()
}
