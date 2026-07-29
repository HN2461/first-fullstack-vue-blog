import { ARTICLE_STATUS } from '#constants/domain'
import { Article } from '#modules/content/models/Article.js'
import { Reaction } from '#modules/interaction/models/Reaction.js'

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
  const article = await Article.findOne({
    _id: articleId,
    status: ARTICLE_STATUS.PUBLISHED,
    deletedAt: null
  })

  if (!article) {
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
    // 点赞和收藏属于互动统计，不应刷新文章的业务修改时间。
    await Article.updateOne(
      { _id: article._id },
      { $inc: { [getCounterName(type)]: 1 } },
      { timestamps: false }
    )
  }

  return buildArticleReactionPayload(article, user._id)
}

export async function removeArticleReaction(articleId, user, type) {
  const article = await Article.findOne({
    _id: articleId,
    status: ARTICLE_STATUS.PUBLISHED,
    deletedAt: null
  })

  if (!article) {
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
    await Article.updateOne(
      { _id: article._id, [getCounterName(type)]: { $gt: 0 } },
      { $inc: { [getCounterName(type)]: -1 } },
      { timestamps: false }
    )
  }

  return buildArticleReactionPayload(article, user._id)
}
