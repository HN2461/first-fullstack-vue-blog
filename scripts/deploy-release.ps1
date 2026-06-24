param(
  [switch]$SkipChecks,
  [switch]$SkipPackage
)

$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
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

  Invoke-Step -Title '后端测试' -Action {
    Push-Location (Join-Path $root 'backend')
    try {
      npm run test
    } finally {
      Pop-Location
    }
  }

  Invoke-Step -Title '编码检查' -Action {
    & (Join-Path $root 'scripts\check-encoding.ps1')
  }
}

if (-not $SkipPackage) {
  Invoke-Step -Title '生成发布包' -Action {
    & (Join-Path $root 'scripts\package-release.ps1')
  }
}

$frontendZip = Join-Path $root 'release\frontend-dist.zip'
$backendZip = Join-Path $root 'release\backend-release.zip'
$env:DEPLOY_PROJECT_ROOT = $root.Path

if (-not (Test-Path -LiteralPath $frontendZip) -or -not (Test-Path -LiteralPath $backendZip)) {
  throw '未找到发布包，请先执行 scripts/package-release.ps1。'
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

local_files = [
    (os.path.join(root, 'release', 'frontend-dist.zip'), '/www/personal-blog/backups/frontend-dist.zip'),
    (os.path.join(root, 'release', 'backend-release.zip'), '/www/personal-blog/backups/backend-release.zip'),
]

script = r"""set -euo pipefail

RELEASE_DIR=/www/personal-blog/backups/release-$(date +%Y%m%d-%H%M%S)
mkdir -p "$RELEASE_DIR"
echo "RELEASE_DIR=$RELEASE_DIR"

echo "[1/9] MongoDB backup"
mongodump --uri="mongodb://127.0.0.1:27017/personal_fullstack_blog" --out="$RELEASE_DIR/mongodb-before"
test -d "$RELEASE_DIR/mongodb-before/personal_fullstack_blog"

echo "[2/9] File backups"
cp -a /www/personal-blog/frontend "$RELEASE_DIR/frontend-before"
cp -a /www/personal-blog/backend "$RELEASE_DIR/backend-before"
cp -a /www/personal-blog/uploads "$RELEASE_DIR/uploads-before"
test -f /www/personal-blog/backend/.env
cp /www/personal-blog/backend/.env "$RELEASE_DIR/backend.env.before-release"

echo "[3/9] Publish frontend"
rm -rf /www/personal-blog/frontend/*
unzip -oq /www/personal-blog/backups/frontend-dist.zip -d /www/personal-blog/frontend
test -f /www/personal-blog/frontend/index.html

echo "[4/9] Publish backend"
OLD_BACKEND=/www/personal-blog/backend_old_$(date +%Y%m%d_%H%M%S)
mv /www/personal-blog/backend "$OLD_BACKEND"
mkdir -p /www/personal-blog/backend
unzip -oq /www/personal-blog/backups/backend-release.zip -d /www/personal-blog/backend
cp "$RELEASE_DIR/backend.env.before-release" /www/personal-blog/backend/.env
chmod 600 /www/personal-blog/backend/.env
test -f /www/personal-blog/backend/package.json

echo "OLD_BACKEND=$OLD_BACKEND"

echo "[5/9] Install backend dependencies"
cd /www/personal-blog/backend
npm install --omit=dev

echo "[6/9] Restart PM2"
pm2 restart personal-blog-api --update-env

echo "[7/9] PM2 status"
pm2 jlist | node -e "let s=''; process.stdin.on('data',d=>s+=d); process.stdin.on('end',()=>{const apps=JSON.parse(s); const app=apps.find(a=>a.name==='personal-blog-api'); if(!app){console.error('PM2 app missing'); process.exit(2)} console.log(JSON.stringify({name:app.name,status:app.pm2_env.status,restarts:app.pm2_env.restart_time,pid:app.pid}, null, 2)); if(app.pm2_env.status!=='online') process.exit(3)})"

echo "[8/9] Local health"
for i in 1 2 3 4 5; do
  if curl -fsS http://127.0.0.1:3001/api/health; then echo; break; fi
  sleep 2
  if [ "$i" = "5" ]; then exit 4; fi
done

echo "[9/9] Save PM2 and sizes"
pm2 save
ls -lh /www/personal-blog/frontend/index.html /www/personal-blog/backend/package.json /www/personal-blog/backups/frontend-dist.zip /www/personal-blog/backups/backend-release.zip
echo "DONE_RELEASE_DIR=$RELEASE_DIR"
"""

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

    stdin, stdout, stderr = client.exec_command('bash -se', get_pty=False, timeout=300)
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
}

Invoke-Step -Title '公网健康检查' -Action {
  $health = Invoke-WebRequest -Uri "http://$($env:DEPLOY_HOST)/api/health" -UseBasicParsing -TimeoutSec 20
  $homeResponse = Invoke-WebRequest -Uri "http://$($env:DEPLOY_HOST)/" -UseBasicParsing -TimeoutSec 20
  Write-Host $health.Content
  Write-Host "HOME_STATUS=$($homeResponse.StatusCode)"
}
