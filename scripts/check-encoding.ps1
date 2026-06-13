$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$extensions = @('*.js', '*.vue', '*.json', '*.md', '*.css', '*.html', '*.env', '*.example')
$files = foreach ($extension in $extensions) {
  Get-ChildItem -LiteralPath $root -Recurse -File -Filter $extension |
    Where-Object {
      $_.FullName -notmatch '\\node_modules\\' -and
      $_.FullName -notmatch '\\dist\\' -and
      $_.FullName -notmatch '\\coverage\\'
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
