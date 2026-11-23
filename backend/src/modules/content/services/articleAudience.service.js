import { ARTICLE_STATUS } from '#constants/domain'

/**
 * 供首页、检索、目录和详情构造同一阅读条件。userId 来自服务端认证，
 * 未登录时只返回作者显式公开的已发布文章；历史未标记记录按成员文章处理。
 */
export function readableArticleFilter(userId) {
  return {
    status: ARTICLE_STATUS.PUBLISHED,
    deletedAt: null,
    ...(userId ? {} : { audience: 'public' })
  }
}
