$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$frontendDir = Join-Path $root 'frontend'
$backendDir = Join-Path $root 'backend'
$releaseDir = Join-Path $root 'release'
$backendStageDir = Join-Path $releaseDir 'backend-release'
$frontendZip = Join-Path $releaseDir 'frontend-dist.zip'
$backendZip = Join-Path $releaseDir 'backend-release.zip'

function Copy-RequiredItem {
  param(
    [Parameter(Mandatory = $true)][string]$Source,
    [Parameter(Mandatory = $true)][string]$Destination
  )

  if (-not (Test-Path -LiteralPath $Source)) {
    throw "缺少必需发布文件：$Source"
  }

  Copy-Item -LiteralPath $Source -Destination $Destination -Recurse -Force
}

function Copy-OptionalItem {
  param(
    [Parameter(Mandatory = $true)][string]$Source,
    [Parameter(Mandatory = $true)][string]$Destination
  )

  if (Test-Path -LiteralPath $Source) {
    Copy-Item -LiteralPath $Source -Destination $Destination -Recurse -Force
  }
}

function Assert-ExcludedPathMissing {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$Name
  )

  if (Test-Path -LiteralPath $Path) {
    throw "后端发布包暂存目录中不应包含 $Name：$Path"
  }
}

if (-not (Test-Path -LiteralPath (Join-Path $frontendDir 'dist\index.html'))) {
  throw "未找到 frontend/dist/index.html。请先执行：cd frontend; npm run build"
}

Remove-Item -LiteralPath $releaseDir -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $releaseDir | Out-Null
New-Item -ItemType Directory -Path $backendStageDir | Out-Null

Write-Host '正在打包前端发布包...'
Compress-Archive -Path (Join-Path $frontendDir 'dist\*') -DestinationPath $frontendZip -Force

Write-Host '正在准备后端发布暂存目录...'
Copy-RequiredItem -Source (Join-Path $backendDir 'package.json') -Destination $backendStageDir
Copy-RequiredItem -Source (Join-Path $backendDir 'package-lock.json') -Destination $backendStageDir
Copy-RequiredItem -Source (Join-Path $backendDir 'ecosystem.config.cjs') -Destination $backendStageDir
Copy-RequiredItem -Source (Join-Path $backendDir 'src') -Destination (Join-Path $backendStageDir 'src')

Copy-OptionalItem -Source (Join-Path $backendDir '.env.example') -Destination $backendStageDir
Copy-OptionalItem -Source (Join-Path $backendDir 'README.md') -Destination $backendStageDir
Copy-OptionalItem -Source (Join-Path $backendDir 'vitest.config.js') -Destination $backendStageDir
Copy-OptionalItem -Source (Join-Path $backendDir 'tests') -Destination (Join-Path $backendStageDir 'tests')

Assert-ExcludedPathMissing -Path (Join-Path $backendStageDir '.env') -Name '.env'
Assert-ExcludedPathMissing -Path (Join-Path $backendStageDir 'node_modules') -Name 'node_modules'
Assert-ExcludedPathMissing -Path (Join-Path $backendStageDir 'uploads') -Name 'uploads'

Write-Host '正在打包后端发布包...'
Compress-Archive -Path (Join-Path $backendStageDir '*') -DestinationPath $backendZip -Force
Remove-Item -LiteralPath $backendStageDir -Recurse -Force

Write-Host ''
Write-Host '发布包生成完成：'
Get-Item -LiteralPath $frontendZip, $backendZip | Select-Object FullName, Length, LastWriteTime | Format-Table -AutoSize
Write-Host ''
Write-Host '上传到服务器目录：/www/personal-blog/backups/'
