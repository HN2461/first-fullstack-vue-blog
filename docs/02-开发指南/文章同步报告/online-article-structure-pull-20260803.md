# 线上文章结构拉取报告

- 生成时间：2026-08-03T03:13:30.875Z
- 线上导出时间：2026-08-03T03:03:53.296Z
- 同步方向：线上数据库 -> 本地 output/线上文章
- 线上文章：512 篇
- 分类：95 个
- 缺失文件：0 个
- 本地替换前备份：backups/output-online-before-pull-20260803-local
- 线上导出包：/www/personal-blog/backups/article-repository-online-20260803.zip
- 本地导出包：backups/article-repository-online-20260803.zip

## 本次结构变化

- 文章正文 hash 在拉取时与旧本地快照一致，没有发现线上正文改写。
- 57 篇文章的分类路径与旧本地快照不同，属于线上后台目录结构调整后的结果。
- 分类总数从旧快照 96 个变为 95 个。
- 导出文件名按当前后端规则统一为短横线格式，例如 `第-01-篇：...`。

## Python 当前目录

| 分类路径 | 文章数 |
| --- | ---: |
| 后端技术 / Python | 1 |
| 后端技术 / Python / 知识目录 | 29 |
| 后端技术 / Python / 网络爬虫与数据分析 | 6 |
| 后端技术 / Python / Web入门 | 18 |

## 本地修正

- 已修正 Python 总目录文章中旧的 `02-应用实例/网络爬虫与数据分析`、`02-应用实例/Web入门/FastAPI从0到1` 等内容路径说明。
- `manifest.json` 中 `python-learning-index` 的 `contentHash` 保留线上拉取时的基线值；后续运行 `article-authority:compare` 时，该文章应被识别为本地正文待推送。
