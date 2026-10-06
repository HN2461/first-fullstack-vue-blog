param(
  [ValidateSet('full', 'backend', 'frontend')]
  [string]$Target = 'full',
  [string[]]$BackendTestFiles = @(),
  [switch]$SkipChecks,
  [switch]$SkipPackage,
  [switch]$RunDatabaseTasks,
  [switch]$ResetBookmarkData,
  [switch]$ClearQuestionBankHistory
)

$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$includeFrontend = $Target -in @('full', 'frontend')
$includeBackend = $Target -in @('full', 'backend')

if (($RunDatabaseTasks -or $ResetBookmarkData -or $ClearQuestionBankHistory) -and -not $includeBackend) {
  throw '数据库任务、书签重置和题库历史清理必须和 backend 或 full 发布目标一起使用。'
}
if ($BackendTestFiles.Count -gt 0 -and -not $includeBackend) {
  throw '-BackendTestFiles 只能与 backend 或 full 发布目标一起使用。'
}
$localConfig = Join-Path $PSScriptRoot 'deploy.local.ps1'

if (Test-Path -LiteralPath $localConfig) {
  . $localConfig
}

if (-not $env:DEPLOY_HOST -or -not $env:DEPLOY_USER -or -not $env:DEPLOY_PASSWORD) {
  throw '缺少部署凭据。请在 scripts/deploy.local.ps1 中设置 DEPLOY_HOST、DEPLOY_USER、DEPLOY_PASSWORD。'
}

function Invoke-Step {
  param(
    [Parameter(Mandatory = $true)][string]$Title,
    [Parameter(Mandatory = $true)][scriptblock]$Action
  )

  Write-Host ''
  Write-Host "== $Title =="
  & $Action
}

if (-not $SkipChecks) {
  if ($includeFrontend) {
    Invoke-Step -Title '前端构建' -Action {
      if (Test-Path -LiteralPath (Join-Path $root 'frontend\dist')) {
        Remove-Item -LiteralPath (Join-Path $root 'frontend\dist') -Recurse -Force
      }
      Push-Location (Join-Path $root 'frontend')
      try {
        npm run build
      } finally {
        Pop-Location
      }
    }
  } else {
    Write-Host '跳过前端构建：当前发布目标为 backend。'
  }

  if ($includeBackend) {
    Invoke-Step -Title '后端测试' -Action {
      Push-Location (Join-Path $root 'backend')
      try {
        if ($BackendTestFiles.Count -gt 0) {
          foreach ($testFile in $BackendTestFiles) {
            if (-not (Test-Path -LiteralPath (Join-Path (Get-Location) $testFile))) {
              throw "指定的后端测试文件不存在：$testFile"
            }
          }
          npm run test -- --run @BackendTestFiles
        } else {
          npm run test
        }
      } finally {
        Pop-Location
      }
    }
  } else {
    Write-Host '跳过后端测试：当前发布目标为 frontend。'
  }

  Invoke-Step -Title '编码检查' -Action {
    & (Join-Path $root 'scripts\check-encoding.ps1')
  }
}

if (-not $SkipPackage) {
  Invoke-Step -Title '生成发布包' -Action {
    & (Join-Path $root 'scripts\package-release.ps1') -Target $Target
  }
}

$frontendZip = Join-Path $root 'release\frontend-dist.zip'
$backendZip = Join-Path $root 'release\backend-release.zip'
$env:DEPLOY_PROJECT_ROOT = $root.Path
$env:DEPLOY_TARGET = $Target
$env:DEPLOY_RESET_BOOKMARK_DATA = $(if ($ResetBookmarkData) { '1' } else { '0' })
$env:DEPLOY_CLEAR_QUESTION_BANK_HISTORY = $(if ($ClearQuestionBankHistory) { '1' } else { '0' })
$env:DEPLOY_RUN_DATABASE_TASKS = $(if ($RunDatabaseTasks) { '1' } else { '0' })

if (($includeFrontend -and -not (Test-Path -LiteralPath $frontendZip)) -or
    ($includeBackend -and -not (Test-Path -LiteralPath $backendZip))) {
  throw "未找到 $Target 发布目标所需的发布包，请先执行 scripts/package-release.ps1 -Target $Target。"
}

Invoke-Step -Title '上传并部署到服务器' -Action {
  @'
import os
import sys
import time
import paramiko

host = os.environ['DEPLOY_HOST']
user = os.environ['DEPLOY_USER']
password = os.environ['DEPLOY_PASSWORD']
root = os.environ['DEPLOY_PROJECT_ROOT']
target = os.environ.get('DEPLOY_TARGET', 'full')
publish_frontend = target in ('full', 'frontend')
publish_backend = target in ('full', 'backend')
reset_bookmark_data = os.environ.get('DEPLOY_RESET_BOOKMARK_DATA') == '1'
clear_question_bank_history = os.environ.get('DEPLOY_CLEAR_QUESTION_BANK_HISTORY') == '1'
run_database_tasks = publish_backend and os.environ.get('DEPLOY_RUN_DATABASE_TASKS') == '1'

local_files = []
if publish_frontend:
    local_files.append((os.path.join(root, 'release', 'frontend-dist.zip'), '/www/personal-blog/backups/frontend-dist.zip'))
if publish_backend:
    local_files.append((os.path.join(root, 'release', 'backend-release.zip'), '/www/personal-blog/backups/backend-release.zip'))

script = r"""set -euo pipefail

RELEASE_DIR=/www/personal-blog/backups/release-$(date +%Y%m%d-%H%M%S)
mkdir -p "$RELEASE_DIR"
PUBLISH_FRONTEND=__PUBLISH_FRONTEND__
PUBLISH_BACKEND=__PUBLISH_BACKEND__
BACKUP_RUNTIME_DATA=__BACKUP_RUNTIME_DATA__
echo "RELEASE_DIR=$RELEASE_DIR"

if [ "$PUBLISH_BACKEND" = "1" ]; then
  echo "[1/20] MongoDB backup"
  mongodump --uri="mongodb://127.0.0.1:27017/personal_fullstack_blog" --out="$RELEASE_DIR/mongodb-before"
  test -d "$RELEASE_DIR/mongodb-before/personal_fullstack_blog"
else
  echo "[1/20] MongoDB backup skipped; frontend-only deployment cannot modify the database"
fi

echo "[2/20] File backups"
if [ "$PUBLISH_FRONTEND" = "1" ]; then
  cp -a /www/personal-blog/frontend "$RELEASE_DIR/frontend-before"
fi
if [ "$BACKUP_RUNTIME_DATA" = "1" ]; then
  cp -a /www/personal-blog/uploads "$RELEASE_DIR/uploads-before"
  if [ -d /www/personal-blog/work-journal-private ]; then
    cp -a /www/personal-blog/work-journal-private "$RELEASE_DIR/work-journal-private-before"
  else
    mkdir -p "$RELEASE_DIR/work-journal-private-before"
  fi
fi
if [ "$PUBLISH_BACKEND" = "1" ]; then
  test -f /www/personal-blog/backend/.env
  cp /www/personal-blog/backend/.env "$RELEASE_DIR/backend.env.before-release"
fi
if [ "$PUBLISH_BACKEND" = "1" ]; then
  test -f /etc/nginx/conf.d/personal-blog.conf
  cp /etc/nginx/conf.d/personal-blog.conf "$RELEASE_DIR/personal-blog.nginx.before-release.conf"
fi

if [ "$PUBLISH_FRONTEND" = "1" ]; then
  echo "[3/20] Verify frontend release archive"
  unzip -tq /www/personal-blog/backups/frontend-dist.zip >/dev/null
fi

if [ "$PUBLISH_BACKEND" = "1" ]; then
  echo "[4/20] Publish backend"
  unzip -tq /www/personal-blog/backups/backend-release.zip >/dev/null
  BACKEND_BEFORE="$RELEASE_DIR/backend-before"
  mv /www/personal-blog/backend "$BACKEND_BEFORE"
  rollback_backend() {
    code=$?
    if [ "$code" -ne 0 ] && [ -d "$BACKEND_BEFORE" ]; then
      echo "Backend deployment failed; restoring the previous backend"
      pm2 delete personal-blog-api >/dev/null 2>&1 || true
      rm -rf /www/personal-blog/backend
      mv "$BACKEND_BEFORE" /www/personal-blog/backend
      (cd /www/personal-blog/backend && pm2 startOrReload ecosystem.config.cjs --update-env)
    fi
    exit "$code"
  }
  trap rollback_backend EXIT
  mkdir -p /www/personal-blog/backend
  unzip -oq /www/personal-blog/backups/backend-release.zip -d /www/personal-blog/backend
  cp "$RELEASE_DIR/backend.env.before-release" /www/personal-blog/backend/.env
  chmod 600 /www/personal-blog/backend/.env
  test -f /www/personal-blog/backend/package.json
  echo "BACKEND_BEFORE=$BACKEND_BEFORE"
fi

if [ "$PUBLISH_BACKEND" = "1" ]; then
  echo "[5/20] Install backend dependencies"
  cd /www/personal-blog/backend
  npm install --omit=dev --no-audit --no-fund
fi

__DATABASE_TASKS__

echo "[12/20] Optional question bank history cleanup"
__QUESTION_BANK_HISTORY_STEP__

echo "[13/20] Optional bookmark data reset"
__BOOKMARK_RESET_STEP__

__NGINX_SETUP__

if [ "$PUBLISH_BACKEND" = "1" ]; then
  echo "[15/20] Start or reload PM2"
  pm2 startOrReload ecosystem.config.cjs --update-env

  echo "[16/20] PM2 status"
  pm2 jlist | node -e "let s=''; process.stdin.on('data',d=>s+=d); process.stdin.on('end',()=>{const apps=JSON.parse(s); const app=apps.find(a=>a.name==='personal-blog-api'); if(!app){console.error('PM2 app missing'); process.exit(2)} const status={name:app.name,status:app.pm2_env.status,restarts:app.pm2_env.restart_time,pid:app.pid,maxMemoryRestart:app.pm2_env.max_memory_restart}; console.log(JSON.stringify(status, null, 2)); if(app.pm2_env.status!=='online') process.exit(3); if(Number(app.pm2_env.max_memory_restart)!==536870912){console.error('PM2 memory restart threshold missing');process.exit(5)}})"

  echo "[17/20] Local health"
  for i in 1 2 3 4 5; do
    if curl -fsS http://127.0.0.1:3001/api/health; then echo; break; fi
    sleep 2
    if [ "$i" = "5" ]; then exit 4; fi
  done
  trap - EXIT
fi

if [ "$PUBLISH_FRONTEND" = "1" ]; then
  echo "[18/20] Publish frontend"
  rm -rf /www/personal-blog/frontend/*
  unzip -oq /www/personal-blog/backups/frontend-dist.zip -d /www/personal-blog/frontend
  test -f /www/personal-blog/frontend/index.html
fi

__POST_DATABASE_CHECKS__

echo "[20/20] Remove expired rollback copies"
PROJECT_BYTES_BEFORE=$(du -sb /www/personal-blog | awk '{print $1}')
find /www/personal-blog/backups -mindepth 1 -maxdepth 1 -type d -name 'release-*' -printf '%T@ %p\0' \
  | sort -z -nr \
  | tail -z -n +5 \
  | cut -z -d' ' -f2- \
  | xargs -0 -r rm -rf --
PROJECT_BYTES_AFTER=$(du -sb /www/personal-blog | awk '{print $1}')
echo "CLEANUP_BYTES=$((PROJECT_BYTES_BEFORE - PROJECT_BYTES_AFTER))"
echo "RETAINED_RELEASES"
find /www/personal-blog/backups -mindepth 1 -maxdepth 1 -type d -name 'release-*' -printf '%TY-%Tm-%Td %TH:%TM %p\n' | sort
echo "[20/20] Finalize deployment and sizes"
if [ "$PUBLISH_BACKEND" = "1" ]; then
  pm2 save
  nginx -T 2>&1 | grep -A12 'location = /api/admin/media {'
fi
ls -lh /www/personal-blog/frontend/index.html /www/personal-blog/backend/package.json
df -h /www
echo "DONE_RELEASE_DIR=$RELEASE_DIR"
"""

bookmark_reset_step = 'npm run bookmark:reset:apply' if reset_bookmark_data else "echo 'Bookmark reset skipped'"
script = script.replace('__BOOKMARK_RESET_STEP__', bookmark_reset_step)
question_bank_history_step = 'npm run question-bank:history:clear:apply' if clear_question_bank_history else "echo 'Question bank history cleanup skipped'"
script = script.replace('__QUESTION_BANK_HISTORY_STEP__', question_bank_history_step)
script = script.replace('__PUBLISH_FRONTEND__', '1' if publish_frontend else '0')
script = script.replace('__PUBLISH_BACKEND__', '1' if publish_backend else '0')
script = script.replace('__BACKUP_RUNTIME_DATA__', '1' if run_database_tasks else '0')
nginx_setup = r"""echo "[14/20] Ensure large upload proxy configuration"
python3 - <<'PY'
from pathlib import Path

path = Path('/etc/nginx/conf.d/personal-blog.conf')
content = path.read_text(encoding='utf-8')
if 'location = /api/admin/media {' not in content:
    marker = '    location /api/ {'
    if marker not in content:
        raise SystemExit('Cannot find generic API location in Nginx config')
    location = '''    location = /api/admin/media {
        proxy_pass http://127.0.0.1:3001/api/admin/media;
        proxy_http_version 1.1;
        proxy_request_buffering off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

'''
    path.write_text(content.replace(marker, location + marker, 1), encoding='utf-8')
PY
nginx -t
systemctl reload nginx"""
if not publish_backend:
    nginx_setup = "echo 'Nginx configuration unchanged; backend was not published'"
script = script.replace('__NGINX_SETUP__', nginx_setup)
database_steps = r'''echo "[5b/11] Ensure work journal indexes"
npm run work-journal:indexes:apply
npm run work-journal:indexes:verify

echo "[5c/11] Migrate legacy work journal evidence into media assets"
npm run work-journal:media-migrate -- --apply

echo "[6/11] Preview and apply media category ownership migration"
npm run media-categories:dry-run
npm run media-categories:apply
npm run media-categories:verify

echo "[7/11] Reconcile saved article content images"
npm run article-media-bindings:dry-run
npm run article-media-bindings:apply
npm run article-media-bindings:dry-run

echo "[8/11] Ensure reading progress indexes"
npm run reading-progress:indexes:apply
npm run reading-progress:indexes:verify

echo "[9/11] Ensure article share indexes"
npm run article-share:indexes:apply
npm run article-share:indexes:verify

echo "[9b/11] Ensure site profile and first deployment anniversary"
npm run site-profile:dry-run
npm run site-profile:apply
npm run site-profile:dry-run

echo "[10/11] Seed question bank"
npm run question-bank:seed:apply

echo "[11/11] Configure menu page cache"
npm run menu:page-cache:apply
npm run menu:page-cache:dry-run'''
if not run_database_tasks:
    database_steps = "echo 'Database tasks skipped; use -RunDatabaseTasks for migrations and idempotent seed operations'"
script = script.replace('__DATABASE_TASKS__', database_steps)
post_database_checks = r'''echo "[19/20] Verify idempotent data operations"
npm run question-bank:seed
npm run media-categories:verify'''
if not run_database_tasks:
    post_database_checks = "echo 'Post-deploy database verification skipped; database tasks were not requested'"
script = script.replace('__POST_DATABASE_CHECKS__', post_database_checks)

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname=host, username=user, password=password, timeout=20, banner_timeout=20, auth_timeout=20)
try:
    sftp = client.open_sftp()
    try:
        for local, remote in local_files:
            print(f'UPLOAD {os.path.basename(local)} -> {remote}', flush=True)
            sftp.put(local, remote)
    finally:
        sftp.close()

    stdin, stdout, stderr = client.exec_command('bash -se', get_pty=False, timeout=1800)
    stdin.write(script)
    stdin.channel.shutdown_write()

    channel = stdout.channel
    while not channel.exit_status_ready():
        if channel.recv_ready():
            sys.stdout.buffer.write(channel.recv(4096))
            sys.stdout.flush()
        if channel.recv_stderr_ready():
            sys.stderr.buffer.write(channel.recv_stderr(4096))
            sys.stderr.flush()
        time.sleep(0.2)
    while channel.recv_ready():
        sys.stdout.buffer.write(channel.recv(4096))
    while channel.recv_stderr_ready():
        sys.stderr.buffer.write(channel.recv_stderr(4096))
    sys.stdout.flush()
    sys.stderr.flush()

    code = channel.recv_exit_status()
    print(f'REMOTE_EXIT={code}', flush=True)
    if code != 0:
        sys.exit(code)
finally:
    client.close()
'@ | python -
  if ($LASTEXITCODE -ne 0) {
    throw "远程部署失败，Python/SSH 进程退出码：$LASTEXITCODE"
  }
}

Invoke-Step -Title '公网健康检查' -Action {
  $health = Invoke-WebRequest -Uri "http://$($env:DEPLOY_HOST)/api/health" -UseBasicParsing -TimeoutSec 20
  $homeResponse = Invoke-WebRequest -Uri "http://$($env:DEPLOY_HOST)/" -UseBasicParsing -TimeoutSec 20
  Write-Host $health.Content
  Write-Host "HOME_STATUS=$($homeResponse.StatusCode)"
}
