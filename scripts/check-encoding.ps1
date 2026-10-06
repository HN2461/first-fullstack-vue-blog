$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$extensions = @(
  '.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx', '.vue',
  '.json', '.md', '.css', '.html', '.env', '.example',
  '.ps1', '.sh', '.yaml', '.yml', '.toml', '.xml', '.properties', '.sql'
)

# 只扫描 Git 工作集中的相关文本文件，避免把 uploads、backups、构建产物和历史临时目录
# 每次都递归读一遍。--others 让尚未提交的新文件也会被检查，--exclude-standard 遵循 .gitignore。
$trackedPaths = & git -C $root.Path ls-files --cached --others --exclude-standard
if ($LASTEXITCODE -ne 0) {
  throw '无法读取 Git 工作集，编码检查未执行。'
}

$files = foreach ($relativePath in $trackedPaths) {
  if ([string]::IsNullOrWhiteSpace($relativePath)) {
    continue
  }

  $extension = [System.IO.Path]::GetExtension($relativePath).ToLowerInvariant()
  if ($extensions -notcontains $extension) {
    continue
  }

  $absolutePath = Join-Path $root.Path $relativePath
  if (Test-Path -LiteralPath $absolutePath -PathType Leaf) {
    Get-Item -LiteralPath $absolutePath
  }
}

$bomFiles = @()

foreach ($file in $files) {
  $stream = [System.IO.File]::OpenRead($file.FullName)
  try {
    if ($stream.Length -ge 3) {
      $buffer = New-Object byte[] 3
      [void]$stream.Read($buffer, 0, 3)
      if ($buffer[0] -eq 0xEF -and $buffer[1] -eq 0xBB -and $buffer[2] -eq 0xBF) {
        $bomFiles += $file.FullName
      }
    }
  } finally {
    $stream.Dispose()
  }
}

if ($bomFiles.Count -gt 0) {
  Write-Host '发现 UTF-8 BOM 文件：'
  $bomFiles | ForEach-Object { Write-Host $_ }
  exit 1
}

Write-Host '编码检查通过：未发现 UTF-8 BOM。'
