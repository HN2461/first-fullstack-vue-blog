"""文章接口。

这里的函数只处理 HTTP 层信息：参数来自哪里、成功状态码是什么、返回
哪一种 Schema。具体业务交给 services 模块。
"""

from typing import Annotated

from fastapi import APIRouter, Path, Query, Response, status

from app import services
from app.schemas import ArticleCreate, ArticleList, ArticleRead, ArticleUpdate

router = APIRouter(prefix='/articles', tags=['articles'])


@router.get('', response_model=ArticleList)
def list_articles(
    keyword: Annotated[
        str | None,
        Query(min_length=1, max_length=50, description='按标题搜索')
    ] = None
) -> ArticleList:
    articles = services.list_articles(keyword)
    return ArticleList(items=articles, total=len(articles))


@router.get('/{article_id}', response_model=ArticleRead)
def get_article(
    article_id: Annotated[int, Path(gt=0, description='文章 ID')]
) -> ArticleRead:
    return services.get_article(article_id)


@router.post(
    '',
    response_model=ArticleRead,
    status_code=status.HTTP_201_CREATED
)
def create_article(payload: ArticleCreate) -> ArticleRead:
    return services.create_article(payload)


@router.patch('/{article_id}', response_model=ArticleRead)
def update_article(
    article_id: Annotated[int, Path(gt=0)],
    payload: ArticleUpdate
) -> ArticleRead:
    return services.update_article(article_id, payload)


@router.delete('/{article_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_article(
    article_id: Annotated[int, Path(gt=0)]
) -> Response:
    services.delete_article(article_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

