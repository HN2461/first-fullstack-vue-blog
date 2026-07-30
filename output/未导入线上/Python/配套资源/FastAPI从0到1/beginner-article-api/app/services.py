"""文章业务规则。

Router 负责接收 HTTP 请求，Store 负责保存数据，Service 负责组织业务动作。
这个例子中的规则很少，但先建立边界，后面接数据库时会更容易理解。
"""

from app.errors import ArticleNotFoundError
from app.schemas import ArticleCreate, ArticleRead, ArticleUpdate
from app.store import article_store


def list_articles(keyword: str | None = None) -> list[ArticleRead]:
    return article_store.list(keyword)


def get_article(article_id: int) -> ArticleRead:
    article = article_store.get(article_id)
    if article is None:
        raise ArticleNotFoundError(article_id)
    return article


def create_article(payload: ArticleCreate) -> ArticleRead:
    return article_store.create(payload)


def update_article(article_id: int, payload: ArticleUpdate) -> ArticleRead:
    article = get_article(article_id)
    return article_store.update(article, payload)


def delete_article(article_id: int) -> None:
    get_article(article_id)
    article_store.delete(article_id)

