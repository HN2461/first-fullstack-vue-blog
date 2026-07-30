# 知识库文章导出说明

- 导出时间：2026-07-30T15:42:33.614Z
- 导出范围：全部未删除文章
- 文章数量：513
- slug 策略：保留原 slug
- Markdown 文章导出为带 Front Matter 的 .md 文件，与现有文章导入页面兼容。
- 文档型文章导出为独立目录，包含 metadata.json、原始 Word 和可用的 PDF 阅读版。
- 文件会按文章分类路径放入对应目录；选择上级分类时，会导出该分类及其所有子分类文章。
- manifest.json 记录分类元数据、文章总数和逐篇清单，可用于核对全量导出是否完整。
- status、categoryPath、tags 和 sortOrder 保留数据库真实值；本地权威快照同步时会读取这些字段。
- originalId、originalSlug、originalStatus 和 exportedAt 仅用于人工参考，不参与自动覆盖更新。
- 后台“文章导入”仍只创建新草稿或跳过重复，不用于覆盖原文；覆盖必须使用默认 dry-run 的权威快照同步脚本。
