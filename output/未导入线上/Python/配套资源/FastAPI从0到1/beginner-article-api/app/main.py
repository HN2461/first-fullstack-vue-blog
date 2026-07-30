"""应用入口。

在项目根目录执行 `uvicorn app.main:app --reload` 时，Uvicorn 会导入
这个模块，并找到下面名为 app 的 FastAPI 对象。
"""

from fastapi import FastAPI

from app.errors import ArticleNotFoundError, article_not_found_handler
from app.routers.articles import router as article_router


def create_app() -> FastAPI:
    """创建并组装 FastAPI 应用，便于测试时获得干净实例。"""

    application = FastAPI(
        title='小白文章 API',
        version='1.0.0',
        description='FastAPI 从 0 到 1 前五章配套项目'
    )
    application.add_exception_handler(
        ArticleNotFoundError,
        article_not_found_handler
    )
    application.include_router(article_router)

    @application.get('/health', tags=['system'])
    def health_check() -> dict[str, str]:
        return {'status': 'ok'}

    return application


app = create_app()

