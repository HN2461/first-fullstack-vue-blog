"""内存文章仓库。

它只用于入门教学：应用一重启，数据就会消失。第 07 章会用数据库仓库
替换它，但 Router 和 Schema 的基本写法无需推倒重来。
"""

from datetime import UTC, datetime

from app.schemas import ArticleCreate, ArticleRead, ArticleUpdate


class ArticleStore:
    """在当前 Python 进程的字典中保存文章。"""

    def __init__(self) -> None:
        self._articles: dict[int, ArticleRead] = {}
        self._next_id = 1

    def list(self, keyword: str | None = None) -> list[ArticleRead]:
        articles = list(self._articles.values())
        if keyword:
            normalized_keyword = keyword.casefold()
            articles = [
                article
                for article in articles
                if normalized_keyword in article.title.casefold()
            ]
        return articles

    def get(self, article_id: int) -> ArticleRead | None:
        return self._articles.get(article_id)

    def create(self, payload: ArticleCreate) -> ArticleRead:
        article = ArticleRead(
            id=self._next_id,
            title=payload.title,
            content=payload.content,
            summary=payload.summary,
            created_at=datetime.now(UTC)
        )
        self._articles[article.id] = article
        self._next_id += 1
        return article

    def update(
        self,
        article: ArticleRead,
        payload: ArticleUpdate
    ) -> ArticleRead:
        changes = payload.model_dump(exclude_unset=True)
        updated = article.model_copy(update=changes)
        self._articles[article.id] = updated
        return updated

    def delete(self, article_id: int) -> None:
        del self._articles[article_id]

    def clear(self) -> None:
        """只供自动化测试使用，保证测试之间互不影响。"""

        self._articles.clear()
        self._next_id = 1


article_store = ArticleStore()
