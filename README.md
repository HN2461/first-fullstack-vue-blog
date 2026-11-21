# 个人全栈博客系统

个人知识库和技术博客，包含公开门户、登录控制台和管理后台。前端采用 Vue 3 + Vite，后端采用 Express + MongoDB，两个应用各自安装依赖。

## 本地运行

先启动本机 MongoDB。首次配置按 `backend/.env.example` 创建本机 `backend/.env`。在项目根目录打开两个 PowerShell 窗口，分别运行下面两组命令。

~~~powershell
cd frontend
npm ci
npm run dev
~~~

~~~powershell
cd backend
npm ci
npm run dev
~~~

## 常用入口

| 想做什么 | 从这里开始 |
| --- | --- |
| 了解代码、菜单权限和开发约定 | [项目文档索引](docs/README.md) |
| 在新服务器从零搭建，配置 DNS、备案、HTTPS | [首次部署教程](docs/03-部署发布/个人全栈博客系统从开发到上线超级详细教程.md) |
| 将代码更新部署到现有网站，检查结果或回退 | [日常部署说明](docs/03-部署发布/部署说明.md) |
| 修改已上线文章、发布新文章或回写后台运营信息 | [文章本地仓库同步流程](docs/02-开发指南/文章本地仓库同步流程.md) |
| 变更数据库结构或整理历史数据 | [数据库发布与迁移流程](docs/03-部署发布/数据库发布与迁移流程.md) |

文章源在 `output/线上文章` 和 `output/未导入线上`。发布脚本位于 `scripts/`。生产环境配置、MongoDB、公开和私有上传文件由服务器独立保存。
