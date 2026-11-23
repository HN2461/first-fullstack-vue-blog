param(
  [switch]$InstallTask
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$taskName = 'PersonalBlog-RecoveryPull'
if ($InstallTask) {
  $account = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
  $hostExecutable = (Get-Process -Id $PID).Path
  $arguments = '-NoProfile -NonInteractive -WindowStyle Hidden -File "' + $PSCommandPath + '"'
  $action = New-ScheduledTaskAction -Execute $hostExecutable -Argument $arguments -WorkingDirectory $projectRoot
  $schedule = @(
    (New-ScheduledTaskTrigger -Daily -At '05:15')
    (New-ScheduledTaskTrigger -AtLogOn -User $account)
  )
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 30) -ExecutionTimeLimit (New-TimeSpan -Hours 4)
  $principal = New-ScheduledTaskPrincipal -UserId $account -LogonType Interactive -RunLevel Limited
  Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $schedule -Settings $settings -Principal $principal -Force | Out-Null
  Get-ScheduledTaskInfo -TaskName $taskName | Select-Object TaskName, NextRunTime
  return
}

# 登录和定时触发共用当前用户的 DPAPI 密钥；凭据仅从开发机已有配置加载。
. (Join-Path $projectRoot 'scripts/deploy.local.ps1')
$env:PYTHONIOENCODING = 'utf-8'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
$OutputEncoding = [Console]::OutputEncoding
$resultDirectory = Join-Path $projectRoot 'backups/recovery'
New-Item -ItemType Directory -Force -Path $resultDirectory | Out-Null
$logPath = Join-Path $resultDirectory 'pull-latest.log'
python -B (Join-Path $PSScriptRoot 'pull_deployed.py') *> $logPath
if ($LASTEXITCODE -ne 0) {
  throw "恢复点取回失败，可在 $logPath 查看结果"
}
