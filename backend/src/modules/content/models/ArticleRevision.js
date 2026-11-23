import mongoose from 'mongoose'

// 正文按版单独存储，避免长期修订使文章文档达到 MongoDB 的单文档上限。
const articleRevisionSchema = new mongoose.Schema({
  articleId: { type: mongoose.Schema.Types.ObjectId, required: true },
  number: { type: Number, required: true },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  savedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  savedAt: { type: Date, required: true }
})

articleRevisionSchema.index({ articleId: 1, number: -1 }, { unique: true })
export const ArticleRevision = mongoose.model('ArticleRevision', articleRevisionSchema)
