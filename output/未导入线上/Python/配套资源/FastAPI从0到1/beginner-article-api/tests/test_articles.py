"""文章接口的最小回归测试。"""

from fastapi.testclient import TestClient

from app.main import app
from app.store import article_store

client = TestClient(app)


def setup_function() -> None:
    article_store.clear()


def test_create_then_get_article() -> None:
    created_response = client.post(
        '/articles',
        json={
            'title': '第一篇文章',
            'content': '正文内容',
            'summary': '测试摘要'
        }
    )

    assert created_response.status_code == 201
    article_id = created_response.json()['id']

    detail_response = client.get(f'/articles/{article_id}')
    assert detail_response.status_code == 200
    assert detail_response.json()['title'] == '第一篇文章'


def test_empty_title_returns_422() -> None:
    response = client.post(
        '/articles',
        json={'title': '', 'content': '正文内容'}
    )

    assert response.status_code == 422


def test_missing_article_returns_404() -> None:
    response = client.get('/articles/999')

    assert response.status_code == 404
    assert response.json()['error']['code'] == 'ARTICLE_NOT_FOUND'
