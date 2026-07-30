---
title: "Docker 学习笔记：纯小白版"
slug: "docker-learning-notes-for-beginners"
summary: "面向 Docker 零基础学习者，从为什么需要 Docker、镜像和容器是什么、如何运行第一个服务、端口映射、数据挂载、环境变量、Dockerfile、Docker Compose 到常见排错，建立一套可动手验证的入门知识框架。"
category: "Docker"
tags: []
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a4a4564f9ac958d29178031"
originalSlug: "docker-learning-notes-for-beginners"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# Docker 学习笔记：纯小白版

> 本文适合完全没有 Docker 基础的人阅读。目标不是一次性讲完所有细节，而是先建立正确体感：Docker 到底解决什么问题、镜像和容器是什么、为什么服务能跑在一个“看不见的环境”里，以及新手应该按什么顺序练习。

---

## 一、为什么要学 Docker？

开发项目时，最常见的问题不是代码写错，而是环境不一致。

同一套代码在本机能跑，换到服务器就报错，常见原因包括：

| 问题 | 例子 |
| --- | --- |
| 操作系统不同 | 本机是 Windows，服务器是 Linux |
| 运行时版本不同 | 本机 Node.js 是 20，服务器是 16 |
| 依赖缺失 | 本机装了某个库，服务器没有 |
| 配置不一致 | 本机端口、环境变量、数据库地址和服务器不同 |
| 环境被污染 | 装 A 项目依赖时影响了 B 项目 |

Docker 的核心价值就是把：

```text
代码
运行时
依赖
配置
启动命令
```

尽量打包成一个标准化运行单元。只要目标机器安装了 Docker，就可以按同样方式运行。

一句话理解：

```text
Docker 不是让你少写代码，而是让你的程序换一台机器也能按同样环境运行。
```

## 二、Docker 到底是什么？

最适合新手的一句话：

```text
Docker 是一个用来创建、运行和管理隔离应用环境的工具。
```

可以把 Docker 理解成一个“标准化运行环境管理器”：

```text
宿主机：你的真实电脑或服务器
Docker：负责管理隔离环境
容器：一个个正在运行的隔离环境
镜像：创建容器时使用的模板
```

用图表示：

```text
真实电脑 / 服务器
└─ Docker
   ├─ 容器 A：运行 Nginx
   ├─ 容器 B：运行 MySQL
   ├─ 容器 C：运行 Redis
   └─ 容器 D：运行自己的后端项目
```

这些容器之间默认相互隔离，不会随便污染宿主机环境。

## 三、三个核心概念

Docker 入门最先记住这三个词：

| 概念 | 英文 | 作用 | 类比 |
| --- | --- | --- | --- |
| 镜像 | Image | 静态模板，包含运行环境和文件 | 安装包、模板、图纸 |
| 容器 | Container | 镜像运行起来后的实例 | 正在运行的程序 |
| 仓库 | Registry / Repository | 存放镜像的地方 | 应用商店、软件仓库 |

关系如下：

```text
Docker Hub / 镜像仓库
        │
        │ docker pull
        ▼
镜像 Image
        │
        │ docker run
        ▼
容器 Container
```

重点区别：

```text
镜像是静态的。
容器是运行中的。
一个镜像可以创建多个容器。
删除容器不等于删除镜像。
删除镜像不等于删除已经保存到外部的数据。
```

## 四、Docker 不是什么？

新手很容易把 Docker 当成普通软件，这是理解偏差的来源。

| 常见误解 | 正确认知 |
| --- | --- |
| Docker 里的软件会像 QQ 一样出现在桌面 | 容器通常没有图形界面，主要用命令操作 |
| 安装一个镜像就等于安装了一个软件 | 镜像只是模板，真正运行的是容器 |
| 容器删了就什么都没了 | 容器内临时数据会丢，挂载到外部的数据还在 |
| Docker 是虚拟机 | Docker 更轻，容器共享宿主机内核 |
| Docker 只能跑一个服务 | 可以同时跑很多容器 |

更准确的体感是：

```text
普通软件：安装到电脑里，长期驻留。
Docker 容器：按需启动一个隔离环境，用完可以停掉或删掉。
```

## 五、Docker 和虚拟机有什么区别？

| 对比项 | 虚拟机 | Docker 容器 |
| --- | --- | --- |
| 是否包含完整操作系统 | 是 | 否，通常共享宿主机内核 |
| 启动速度 | 慢，常见几十秒 | 快，常见秒级甚至更快 |
| 资源占用 | 高 | 低 |
| 隔离方式 | 更重，更接近完整电脑 | 更轻，更像隔离进程 |
| 适合场景 | 运行完整系统、强隔离 | 运行应用、服务、开发环境 |

一句话：

```text
虚拟机像另开一台完整电脑。
Docker 像在当前系统上开一个隔离应用环境。
```

## 六、安装后先做这三个检查

安装 Docker Desktop 后，不要急着学复杂命令，先确认它能正常工作。

### 6.1 查看 Docker 版本

```powershell
docker --version
```

正常会看到类似：

```text
Docker version 29.6.1, build 8900f1d
```

### 6.2 查看客户端和服务端

```powershell
docker version
```

要同时看到 `Client` 和 `Server`。

如果只有 `Client`，或者提示无法连接 Docker daemon，通常说明 Docker Desktop 后端还没启动成功。

### 6.3 运行 hello-world

```powershell
docker run --rm hello-world
```

看到下面内容，说明 Docker 基础链路正常：

```text
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

这个命令验证了：

```text
Docker CLI 能连接 Docker daemon。
Docker 能拉取镜像。
Docker 能创建容器。
容器能运行并输出日志。
```

## 七、跑第一个真正能访问的服务

运行一个 Nginx Web 服务：

```powershell
docker run -d -p 8080:80 --name my-nginx nginx
```

然后打开浏览器访问：

```text
http://localhost:8080
```

如果看到 Nginx 欢迎页面，说明你已经跑通了一个容器服务。

命令拆解：

```text
docker run        创建并启动容器
-d                后台运行
-p 8080:80        把宿主机 8080 端口映射到容器 80 端口
--name my-nginx   给容器起名
nginx             使用 nginx 镜像
```

查看正在运行的容器：

```powershell
docker ps
```

停止容器：

```powershell
docker stop my-nginx
```

重新启动已经存在的容器：

```powershell
docker start my-nginx
```

删除容器：

```powershell
docker rm my-nginx
```

如果容器还在运行，先停止再删除：

```powershell
docker stop my-nginx
docker rm my-nginx
```

## 八、进入容器内部看看

容器不是黑盒。可以进入容器内部观察它的文件系统和进程。

先启动一个 Nginx 容器：

```powershell
docker run -d -p 8080:80 --name explore-nginx nginx
```

进入容器：

```powershell
docker exec -it explore-nginx bash
```

如果某些镜像没有 `bash`，可以尝试：

```powershell
docker exec -it explore-nginx sh
```

进入后可以执行：

```bash
pwd
ls
cat /etc/os-release
whoami
exit
```

你会发现：

```text
容器里的目录结构和宿主机不一样。
容器有自己的文件系统。
容器里的进程和宿主机普通进程是隔离的。
退出容器 shell 不等于停止容器。
```

清理：

```powershell
docker stop explore-nginx
docker rm explore-nginx
```

## 九、必会命令速查

### 9.1 镜像命令

| 命令 | 作用 |
| --- | --- |
| `docker pull nginx` | 下载镜像 |
| `docker images` | 查看本地镜像 |
| `docker rmi nginx` | 删除镜像 |
| `docker inspect nginx` | 查看镜像详细信息 |
| `docker build -t my-app .` | 根据 Dockerfile 构建镜像 |

### 9.2 容器命令

| 命令 | 作用 |
| --- | --- |
| `docker run nginx` | 创建并启动容器 |
| `docker ps` | 查看运行中的容器 |
| `docker ps -a` | 查看所有容器 |
| `docker stop 容器名` | 停止容器 |
| `docker start 容器名` | 启动已存在的容器 |
| `docker restart 容器名` | 重启容器 |
| `docker rm 容器名` | 删除容器 |
| `docker logs 容器名` | 查看日志 |
| `docker logs -f 容器名` | 实时查看日志 |
| `docker exec -it 容器名 bash` | 进入容器内部 |

### 9.3 系统清理命令

查看 Docker 占用空间：

```powershell
docker system df
```

清理未使用资源：

```powershell
docker system prune
```

更激进的清理：

```powershell
docker system prune -a
```

注意：

```text
docker system prune -a 会删除所有未被容器使用的镜像。
新手不要随手执行，尤其是在你还不清楚哪些镜像后面会用到时。
```

## 十、四个核心机制

### 10.1 后台运行：`-d`

```powershell
docker run -d nginx
```

`-d` 表示 detached mode，也就是后台运行。

不加 `-d` 时，容器前台输出会占用当前终端。关闭终端或中断进程时，容器可能随之停止。

### 10.2 端口映射：`-p`

容器内部服务默认只在容器里监听，宿主机外部不能直接访问。

使用 `-p` 把宿主机端口映射到容器端口：

```powershell
docker run -d -p 8080:80 nginx
```

含义：

```text
宿主机 8080 端口 -> 容器 80 端口
```

访问：

```text
http://localhost:8080
```

新手最容易写反。记住：

```text
-p 宿主机端口:容器端口
```

### 10.3 数据挂载：`-v`

容器默认是临时环境。容器删除后，容器内部新增的数据也会丢失。

如果要保存数据，需要挂载到宿主机目录或 Docker volume。

目录挂载示例：

```powershell
docker run -d -p 8080:80 -v C:\docker-data\html:/usr/share/nginx/html --name web nginx
```

含义：

```text
宿主机目录 C:\docker-data\html
挂载到容器目录 /usr/share/nginx/html
```

PowerShell 中可以先创建目录：

```powershell
New-Item -ItemType Directory -Force -Path C:\docker-data\html
Set-Content -Path C:\docker-data\html\index.html -Value '<h1>Hello Docker</h1>' -Encoding utf8
```

如果你使用的是 Windows PowerShell 5.1，`-Encoding utf8` 可能会写出带 BOM 的 UTF-8 文件。这个 HTML 示例通常不受影响；如果是项目源码或配置文件，建议使用 PowerShell 7 的 `-Encoding utf8NoBOM`，或用编辑器确认保存为 UTF-8 无 BOM。

再运行 Nginx：

```powershell
docker run -d -p 8080:80 -v C:\docker-data\html:/usr/share/nginx/html --name web nginx
```

访问：

```text
http://localhost:8080
```

删除容器后，`C:\docker-data\html` 里的文件仍然存在。

### 10.4 环境变量：`-e`

环境变量用于把配置传给容器。

比如 MySQL root 密码：

```powershell
docker run -d -e MYSQL_ROOT_PASSWORD=123456 --name my-mysql mysql:8.0
```

常见用途：

```text
数据库密码
数据库名
应用启动环境
API 地址
功能开关
```

## 十一、运行 MySQL：把机制串起来

下面这个例子同时使用后台运行、端口映射、数据挂载和环境变量。

```powershell
docker run -d `
  -p 3306:3306 `
  -v C:\docker-data\mysql:/var/lib/mysql `
  -e MYSQL_ROOT_PASSWORD=my-secret-pw `
  --name my-mysql `
  mysql:8.0
```

查看容器：

```powershell
docker ps
```

查看日志：

```powershell
docker logs -f my-mysql
```

连接信息：

```text
主机：localhost
端口：3306
用户：root
密码：my-secret-pw
```

停止并删除容器：

```powershell
docker stop my-mysql
docker rm my-mysql
```

数据仍保存在：

```text
C:\docker-data\mysql
```

再次用同一个目录启动 MySQL，数据仍可复用。

## 十二、Dockerfile：自己制作镜像

前面都是使用别人做好的镜像。真正做项目时，经常需要把自己的应用做成镜像。

这时需要写 `Dockerfile`。

`Dockerfile` 可以理解为：

```text
告诉 Docker 如何从基础镜像开始，一步步把你的项目打包成新镜像。
```

常用指令：

| 指令 | 作用 |
| --- | --- |
| `FROM` | 指定基础镜像 |
| `WORKDIR` | 设置工作目录 |
| `COPY` | 复制文件到镜像里 |
| `RUN` | 构建阶段执行命令 |
| `EXPOSE` | 声明容器端口 |
| `CMD` | 容器启动时默认执行的命令 |

Node.js 示例：

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

构建镜像：

```powershell
docker build -t my-node-app .
```

运行：

```powershell
docker run -d -p 3000:3000 --name my-node-app my-node-app
```

### 12.1 `.dockerignore` 也很重要

`.dockerignore` 类似 `.gitignore`，用于排除不需要复制到镜像里的文件。

示例：

```gitignore
node_modules
dist
.git
.env
logs
```

为什么重要：

```text
减少镜像体积。
避免把本地依赖带进镜像。
避免把敏感配置打进镜像。
加快 docker build 速度。
```

## 十三、Docker Compose：一键启动一组服务

一个真实项目通常不止一个容器。

例如博客系统可能需要：

```text
前端
后端
数据库
Redis
Nginx
```

如果每个服务都手写 `docker run`，会很难维护。

Docker Compose 的作用是：

```text
用一个 docker-compose.yml 描述一组服务，再用一条命令启动它们。
```

示例：

```yaml
services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secret
    volumes:
      - db-data:/var/lib/mysql

volumes:
  db-data:
```

启动：

```powershell
docker compose up -d
```

查看：

```powershell
docker compose ps
```

查看日志：

```powershell
docker compose logs -f
```

关闭并删除这组服务：

```powershell
docker compose down
```

注意：

```text
docker compose down 会删除容器和默认网络。
命名 volume 默认不会删除。
如果加 -v，会连 volume 一起删，数据库数据可能丢失。
```

## 十四、常见问题和排错

### 14.1 Docker 命令能用，但 Docker daemon 连接不上

常见报错：

```text
Cannot connect to the Docker daemon
```

或：

```text
failed to connect to the docker API
```

处理顺序：

```powershell
docker version
docker context ls
docker ps
```

重点检查：

```text
Docker Desktop 是否已经启动。
Docker Desktop 左下角是否显示 running。
当前 context 是否是 desktop-linux。
WSL2 后端是否正常。
```

Windows 上可以尝试：

```powershell
wsl --shutdown
```

然后重新打开 Docker Desktop。

### 14.2 端口被占用

报错类似：

```text
bind: address already in use
```

说明宿主机端口已经被占。

解决方式一：换端口。

```powershell
docker run -d -p 8888:80 nginx
```

解决方式二：查谁占用了端口。

PowerShell：

```powershell
netstat -ano | findstr :8080
```

然后根据 PID 查进程：

```powershell
Get-Process -Id <PID>
```

### 14.3 容器启动后立刻退出

先查看所有容器：

```powershell
docker ps -a
```

再看日志：

```powershell
docker logs <容器名或ID>
```

常见原因：

```text
启动命令执行完就退出了。
配置错误导致程序启动失败。
端口、权限、环境变量不正确。
数据库初始化失败。
```

记住：

```text
容器不是虚拟机。
容器的主进程结束，容器就会退出。
```

### 14.4 数据丢失

最常见原因：

```text
数据只写在容器内部，没有挂载 volume 或宿主机目录。
```

正确做法：

```powershell
docker run -d -v C:\docker-data\mysql:/var/lib/mysql mysql:8.0
```

凡是数据库、上传文件、用户数据，都要先想清楚挂载位置。

### 14.5 Windows 路径挂载问题

Windows 中建议优先使用明确盘符路径：

```powershell
docker run -v C:\docker-data\html:/usr/share/nginx/html nginx
```

如果在 WSL 里执行 Docker 命令，路径可能写成 Linux 风格：

```bash
docker run -v /mnt/c/docker-data/html:/usr/share/nginx/html nginx
```

不要混用路径格式。你在哪里执行命令，就按那个环境的路径规则写。

### 14.6 镜像拉取慢或失败

可能原因：

```text
网络不稳定。
Docker Hub 访问受限。
镜像名写错。
镜像 tag 不存在。
```

先确认镜像名和 tag：

```powershell
docker pull nginx:latest
docker pull mysql:8.0
```

如果是网络问题，可以在 Docker Desktop 的 Docker Engine 设置里配置可用的 registry mirror。镜像源可用性会变化，不建议把来源不明的镜像源长期写死在生产环境。

## 十五、新手练习路线

建议按下面顺序练，不要一上来就学 Kubernetes。

### 第 1 阶段：理解概念

目标：

```text
知道镜像、容器、仓库分别是什么。
知道 docker run 做了什么。
知道容器和虚拟机的区别。
```

必做：

```powershell
docker run --rm hello-world
```

### 第 2 阶段：练熟基础命令

目标：

```text
能查看镜像。
能查看容器。
能启动、停止、删除容器。
能看日志。
能进入容器。
```

练习：

```powershell
docker pull nginx
docker run -d -p 8080:80 --name demo-nginx nginx
docker ps
docker logs demo-nginx
docker exec -it demo-nginx bash
docker stop demo-nginx
docker rm demo-nginx
```

### 第 3 阶段：理解核心机制

目标：

```text
理解 -d、-p、-v、-e。
能运行 Nginx、MySQL 这类常见服务。
知道数据为什么要挂载。
```

### 第 4 阶段：学习 Docker Compose

目标：

```text
能用 docker-compose.yml 同时启动 Web 服务和数据库。
知道 compose up、compose down、compose logs 的区别。
```

### 第 5 阶段：学习 Dockerfile

目标：

```text
能把自己的 Node.js、Python 或 Java 项目打包成镜像。
知道 .dockerignore 的作用。
知道构建镜像和运行容器是两件事。
```

### 第 6 阶段：再看生产环境

后面再学习：

```text
镜像体积优化
多阶段构建
容器网络
私有镜像仓库
CI/CD 构建镜像
线上日志与监控
Kubernetes
```

Kubernetes 不适合 Docker 纯小白一开始就学。先把单机 Docker 和 Compose 练熟更重要。

## 十六、推荐练习任务

### 任务 1：确认安装

```powershell
docker version
docker run --rm hello-world
```

完成标准：

```text
能看到 Docker Client 和 Server。
hello-world 能正常输出。
```

### 任务 2：运行 Nginx

```powershell
docker run -d -p 8080:80 --name web-demo nginx
```

完成标准：

```text
浏览器访问 http://localhost:8080 能看到页面。
docker ps 能看到 web-demo。
docker logs web-demo 能看到日志。
```

清理：

```powershell
docker stop web-demo
docker rm web-demo
```

### 任务 3：体验挂载

```powershell
New-Item -ItemType Directory -Force -Path C:\docker-data\html
Set-Content -Path C:\docker-data\html\index.html -Value '<h1>Hello Docker Volume</h1>' -Encoding utf8
docker run -d -p 8080:80 -v C:\docker-data\html:/usr/share/nginx/html --name volume-demo nginx
```

完成标准：

```text
访问 http://localhost:8080 能看到自己写的 HTML。
修改 C:\docker-data\html\index.html 后刷新浏览器能看到变化。
删除容器后，本地 HTML 文件仍然存在。
```

清理：

```powershell
docker stop volume-demo
docker rm volume-demo
```

### 任务 4：运行 MySQL

```powershell
docker run -d `
  -p 3306:3306 `
  -v C:\docker-data\mysql:/var/lib/mysql `
  -e MYSQL_ROOT_PASSWORD=hello123456 `
  --name mysql-demo `
  mysql:8.0
```

完成标准：

```text
docker ps 能看到 mysql-demo。
docker logs mysql-demo 能看到 MySQL ready for connections。
可以用数据库客户端连接 localhost:3306。
```

清理容器但保留数据：

```powershell
docker stop mysql-demo
docker rm mysql-demo
```

如要连数据也删除，再手动删除：

```powershell
Remove-Item -LiteralPath C:\docker-data\mysql -Recurse -Force
```

### 任务 5：写一个 compose 文件

新建 `docker-compose.yml`：

```yaml
services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secret
    volumes:
      - db-data:/var/lib/mysql

volumes:
  db-data:
```

启动：

```powershell
docker compose up -d
```

查看：

```powershell
docker compose ps
```

关闭：

```powershell
docker compose down
```

## 十七、学习 Docker 的正确心法

不要把 Docker 当成“又一个要背的工具”。

它真正重要的是这几个判断：

```text
这个项目需要什么运行环境？
这个服务要暴露哪个端口？
哪些数据不能随着容器删除而丢失？
哪些配置应该通过环境变量传入？
多个服务之间怎么一起启动？
```

能回答这些问题，就已经不只是会敲命令，而是在理解容器化。

新手最有效的学习方式：

```text
每学一个命令，立刻跑一次。
每跑一个容器，立刻看 docker ps、docker logs。
每遇到异常，先看日志，再看端口，再看挂载，再看环境变量。
每次练习结束，主动清理容器，避免越积越乱。
```

## 十八、最终速查表

### 镜像

```powershell
docker pull nginx
docker images
docker rmi nginx
docker build -t my-app .
```

### 容器

```powershell
docker run -d -p 8080:80 --name web nginx
docker ps
docker ps -a
docker logs web
docker logs -f web
docker exec -it web bash
docker stop web
docker start web
docker restart web
docker rm web
```

### Compose

```powershell
docker compose up -d
docker compose ps
docker compose logs -f
docker compose down
```

### 排查

```powershell
docker version
docker context ls
docker info
docker system df
netstat -ano | findstr :8080
```

### 清理

```powershell
docker system prune
```

谨慎使用：

```powershell
docker system prune -a
```

## 十九、总结

Docker 入门可以归纳成一句话：

```text
用镜像定义环境，用容器运行服务，用端口对外访问，用挂载保存数据，用 Compose 管理多服务。
```

学习顺序也很清楚：

```text
先跑 hello-world
再跑 Nginx
再理解端口映射
再练数据挂载
再跑 MySQL
再学 Dockerfile
最后学 Docker Compose
```

只要你能独立完成 Nginx、MySQL、Compose 这三组练习，Docker 的入门门槛基本就跨过去了。
