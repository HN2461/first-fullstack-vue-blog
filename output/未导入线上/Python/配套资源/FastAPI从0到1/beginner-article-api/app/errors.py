"""业务异常及其 HTTP 转换。

Service 不直接返回 HTTP 响应，它只描述“文章不存在”这件事。
异常处理器负责把业务事实转换为 HTTP 404。
"""

from fastapi import Request
from fastapi.responses import JSONResponse


class ArticleNotFoundError(Exception):
    """指定文章不存在。"""

    def __init__(self, article_id: int) -> None:
        self.article_id = article_id
        super().__init__(f'文章 {article_id} 不存在')


async def article_not_found_handler(
    request: Request,
    exc: ArticleNotFoundError
) -> JSONResponse:
    """把文章不存在异常统一转换为 404 JSON 响应。"""

    return JSONResponse(
        status_code=404,
        content={
            'error': {
                'code': 'ARTICLE_NOT_FOUND',
                'message': f'文章 {exc.article_id} 不存在'
            }
        }
    )

