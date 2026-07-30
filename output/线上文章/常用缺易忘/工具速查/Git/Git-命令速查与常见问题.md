---
title: "Git 命令速查与常见问题"
slug: "git-5aba4c87"
summary: "从 VSCode 插件点按钮过渡到命令行操作的 Git 速查手册，涵盖日常命令、分支管理、撤销回退、以及国内连不上 GitHub 的解决方案。"
category: "Git"
tags:
  - "Git"
  - "命令行"
  - "GitHub"
  - "版本控制"
  - "问题排查"
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a2d291f8a2b1c68f2cac308"
originalSlug: "git-5aba4c87"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# Git 命令速查与常见问题

> 习惯了 VSCode 插件点按钮？这份手册帮你把每个按钮背后的命令对应起来，遇到问题也能自己排查。

---

## 一、日常基础操作

### 查看状态
```bash
git status              # 查看当前工作区状态（最常用，不确定时先跑这个）
git log --oneline       # 简洁查看提交历史
git log --oneline --graph --all  # 带分支图的历史
```

### 暂存 & 提交
```bash
git add .               # 暂存所有改动（对应 VSCode "Stage All Changes"）
git add 文件名           # 只暂存某个文件
git commit -m "提交说明" # 提交（对应 VSCode "Commit" 按钮）
git commit -am "说明"   # 暂存 + 提交一步完成（仅已追踪文件）
```

### 拉取 & 推送
```bash
git pull                # 拉取远程最新代码并合并（对应 VSCode "Pull"）
git pull origin main    # 明确指定远程和分支
git push                # 推送到远程（对应 VSCode "Push"）
git push origin main    # 明确指定推送目标
git push -u origin main # 首次推送并设置上游，之后直接 git push 即可
```

### 克隆仓库
```bash
git clone https://github.com/用户名/仓库名.git
git clone git@github.com:用户名/仓库名.git  # SSH 方式
```

---

## 二、分支操作

```bash
git branch              # 查看本地所有分支
git branch -a           # 查看本地 + 远程所有分支
git branch 分支名        # 创建新分支
git checkout 分支名      # 切换分支（旧写法）
git switch 分支名        # 切换分支（新写法，推荐）
git checkout -b 分支名   # 创建并切换（对应 VSCode "Create Branch"）
git switch -c 分支名     # 同上，新写法

git merge 分支名         # 将指定分支合并到当前分支
git branch -d 分支名     # 删除本地分支（已合并）
git branch -D 分支名     # 强制删除本地分支
git push origin --delete 分支名  # 删除远程分支
```

---

## 三、撤销 & 回退

```bash
# 撤销工作区改动（未 add，对应 VSCode "Discard Changes"）
git checkout -- 文件名
git restore 文件名       # 新写法

# 撤销暂存（已 add 但未 commit，对应 VSCode "Unstage"）
git reset HEAD 文件名
git restore --staged 文件名  # 新写法

# 撤销最近一次提交（保留改动在工作区）
git reset --soft HEAD~1

# 撤销最近一次提交（改动也丢掉，慎用）
git reset --hard HEAD~1

# 查看某次提交改了什么
git show 提交hash
git diff HEAD~1 HEAD     # 对比最近两次提交的差异
```

---

## 四、远程仓库管理

```bash
git remote -v                        # 查看当前远程地址
git remote set-url origin 新地址     # 修改远程地址
git remote add origin 地址           # 添加远程（首次）
git remote remove origin             # 删除远程配置
```

---

## 五、暂存工作现场（stash）

```bash
git stash               # 临时保存当前改动（对应 VSCode "Stash Changes"）
git stash pop           # 恢复最近一次 stash
git stash list          # 查看所有 stash
git stash drop          # 删除最近一次 stash
```

---

## 六、常见问题排查

### ❌ 连不上 GitHub（443 端口超时）

报错：`Failed to connect to github.com port 443`

国内直连 GitHub 不稳定，按以下顺序排查：

**第一步：先看远程地址是 HTTPS 还是 SSH**
```bash
git remote -v
```

- 如果远程是 `https://github.com/...`，下面讲的 `http.proxy` / `https.proxy` 才会生效
- 如果远程是 `git@github.com:...`，它走的是 SSH，应该优先检查 `ssh -T git@github.com`

**第二步：检查是否有残留代理配置**
```bash
git config --global --get http.proxy
git config --global --get https.proxy
```
有输出就清掉：
```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

**第三步：先别急着怪梯子，先理解“浏览器能上，不代表 Git 能上”**

很多新手会卡在这里：

- 浏览器可以打开 GitHub
- Clash 也显示已经启动
- 但 `git pull`、`git clone` 还是超时

这通常不是“VPN 软件不对”，而是**浏览器走了代理，但 Git 所在终端没有走代理**。

常见原因有三种：

- Git 没有单独配置代理
- 以前配过旧端口，比如 `7890`，现在 Clash 实际端口已经变成 `7897`
- 远程仓库明明是 HTTPS，却一直按 SSH 的思路排查，方向跑偏了

先用下面的命令直接验证 Git 当前能不能打到远程：
```bash
git ls-remote origin
```

- 能输出 `HEAD` 和分支 hash，说明网络通了
- 如果还是报 `Failed to connect to github.com port 443`，继续下面步骤

**第四步：开了 Clash / Mihomo 但 Git 还是不通**

如果你的代理软件里能看到本地端口，例如：

- `127.0.0.1:7897`：常见混合端口
- `127.0.0.1:7890`：常见 HTTP 代理端口
- `127.0.0.1:1080`：常见 SOCKS 端口

那就把 Git 明确指向这个端口。以 Clash / Mihomo 混合端口 `7897` 为例：
```bash
git config --global http.proxy http://127.0.0.1:7897
git config --global https.proxy http://127.0.0.1:7897
git ls-remote origin
```

如果 `git ls-remote origin` 已经能看到远程分支信息，再执行：
```bash
git pull
git push
```

如果以后不想让 Git 一直走代理，再撤销：
```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

> 一句话记忆：浏览器代理是浏览器代理，Git 代理是 Git 代理；Clash 开着，不代表 Git 自动会走。

**第五步：用镜像代理（不需要梯子，推荐）**
```bash
# 临时换成镜像地址
git remote set-url origin https://mirror.ghproxy.com/https://github.com/用户名/仓库名.git
git pull

# 用完换回来
git remote set-url origin https://github.com/用户名/仓库名.git
```

**第六步：换 SSH 协议**
```bash
git remote set-url origin git@github.com:用户名/仓库名.git
git pull
```
> 前提：本机已配好 SSH Key 并添加到 GitHub 账号。

**第七步：你怀疑是代理本身有问题时，优先看这几个检查点**
```bash
git config --global --get http.proxy
git config --global --get https.proxy
git remote -v
git ls-remote origin
```

重点看：

- 代理端口是不是和 Clash 当前显示的一致
- 当前远程是 HTTPS 还是 SSH
- Git 失败时，是连接超时、证书问题，还是认证失败

如果已经不再使用本地代理客户端，但 Git 里还残留着旧代理地址，也会导致一直连不上。

---

### ❌ push 被拒绝（non-fast-forward）

报错：`rejected ... non-fast-forward`

远程有你本地没有的提交，先 pull 再 push：
```bash
git pull --rebase origin main
git push
```

---

### ❌ 合并冲突

```bash
git status              # 查看哪些文件冲突
# 手动编辑冲突文件，删掉 <<<< ==== >>>> 标记，保留正确内容
git add 冲突文件
git commit              # 完成合并提交
```

---

### ❌ 误删文件想恢复

```bash
git checkout HEAD -- 文件名   # 从最近提交恢复
git restore 文件名             # 新写法
```

---

### ❌ 提交了不该提交的文件

```bash
# 从版本库移除但保留本地文件
git rm --cached 文件名
git commit -m "移除误提交文件"

# 然后把文件加到 .gitignore 防止再次提交
```

---

### ❌ 想修改最近一次提交说明

```bash
git commit --amend -m "新的提交说明"
# 注意：已 push 到远程的提交不建议 amend，会导致历史不一致
```

---

## 七、SSH Key 配置（一次性操作）

```bash
# 生成 SSH Key
ssh-keygen -t ed25519 -C "你的邮箱"

# 查看公钥内容，复制到 GitHub Settings → SSH Keys
cat ~/.ssh/id_ed25519.pub

# 测试是否配置成功
ssh -T git@github.com
```

---

## 八、VSCode 按钮 vs 命令行对照

| VSCode 操作 | 对应命令 |
|---|---|
| Source Control 面板 | `git status` |
| Stage All Changes | `git add .` |
| Unstage | `git restore --staged 文件名` |
| Discard Changes | `git restore 文件名` |
| Commit | `git commit -m "说明"` |
| Pull | `git pull` |
| Push | `git push` |
| Sync Changes | `git pull` + `git push` |
| Create Branch | `git switch -c 分支名` |
| Checkout Branch | `git switch 分支名` |
| Merge Branch | `git merge 分支名` |
| Stash Changes | `git stash` |
| Pop Stash | `git stash pop` |
