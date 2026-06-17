import { Article } from '../models/Article.js'
import { Reaction } from '../models/Reaction.js'

function createHttpError(statusCode, code, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

function getCounterName(type) {
  return type === 'favorite' ? 'favoriteCount' : 'likeCount'
}

async function buildArticleReactionPayload(article, userId) {
  const payload = article.toSafeJSON()

  if (!userId) {
    return {
      ...payload,
      likedByCurrentUser: false,
      favoritedByCurrentUser: false
    }
  }

  const reactions = await Reaction.find({
    user: userId,
    targetType: 'article',
    targetId: article._id,
    type: { $in: ['like', 'favorite'] }
  }).select('type')

  const reactionTypes = new Set(reactions.map((item) => item.type))

  return {
    ...payload,
    likedByCurrentUser: reactionTypes.has('like'),
    favoritedByCurrentUser: reactionTypes.has('favorite')
  }
}

export async function addArticleReaction(articleId, user, type) {
  const article = await Article.findById(articleId)

  if (!article || article.deletedAt) {
    throw createHttpError(404, 'ARTICLE_NOT_FOUND', '文章不存在')
  }

  const exists = await Reaction.exists({
    user: user._id,
    targetType: 'article',
    targetId: article._id,
    type
  })

  if (!exists) {
    await Reaction.create({
      user: user._id,
      targetType: 'article',
      targetId: article._id,
      type
    })
    article[getCounterName(type)] += 1
    await article.save()
  }

  return buildArticleReactionPayload(article, user._id)
}

export async function removeArticleReaction(articleId, user, type) {
  const article = await Article.findById(articleId)

  if (!article || article.deletedAt) {
    throw createHttpError(404, 'ARTICLE_NOT_FOUND', '文章不存在')
  }

  const deleted = await Reaction.findOneAndDelete({
    user: user._id,
    targetType: 'article',
    targetId: article._id,
    type
  })

  if (deleted && article[getCounterName(type)] > 0) {
    article[getCounterName(type)] -= 1
    await article.save()
  }

  return buildArticleReactionPayload(article, user._id)
}
