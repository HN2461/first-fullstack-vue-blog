# 个人全栈博客系统

这是一个从零开始建设的全栈个人技术博客系统，采用 Vue 3、Express 和 MongoDB。

现有静态博客 `个人技术博客网站` 只作为 UI 参考和后期 Markdown 内容迁移来源，新系统运行时不依赖旧项目的静态索引文件。

## 本地开发

1. 安装 Node.js 20 或更高版本。
2. 安装并启动 MongoDB。
3. 复制 `.env.example` 为 `.env`，按本机环境修改配置。
4. 执行 `npm install`。
5. 执行 `npm run dev`。

## 目录

- `client/`：Vue 3 前端。
- `server/`：Express API 服务。
- `shared/`：共享常量和枚举。
- `uploads/`：本地上传文件目录。
- `docs/`：项目文档。

## 初始化管理员

复制 `.env.example` 为 `.env` 后，填写：

- `ADMIN_USERNAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

然后执行：

```bash
npm run create:admin --workspace server
```

管理员账号用于登录 `/admin` 后台。普通注册用户不能访问后台。
