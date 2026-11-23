#!/usr/bin/env bash
set -euo pipefail
umask 077

source_dir=$(cd -- "$(dirname -- "$0")" && pwd)
target=/www/personal-blog/runtime/recovery
recipient=${1:?请提供开发机生成的公开证书 recipient.pem}
openssl x509 -in "$recipient" -checkend 86400 -noout >/dev/null
for command in python3 openssl mongod mongosh mongodump mongorestore ip unshare tar systemctl node; do
  command -v "$command" >/dev/null
done
install -d -m 700 "$target"
if [[ -f "$target/recipient.pem" ]] && ! cmp -s "$target/recipient.pem" "$recipient"; then
  echo '已安装的证书不同，请先核对恢复密钥的轮换与旧归档可读性。' >&2
  exit 1
fi
if [[ ! -f "$target/recipient.pem" ]]; then
  install -m 600 "$recipient" "$target/recipient.pem"
fi
if [[ ! "$source_dir/snapshot.py" -ef "$target/snapshot.py" ]]; then
  install -m 700 "$source_dir/snapshot.py" "$target/snapshot.py.next"
  mv -f "$target/snapshot.py.next" "$target/snapshot.py"
fi

node_dir=$(dirname -- "$(command -v node)")
cat >/etc/systemd/system/personal-blog-recovery.service <<EOF
[Unit]
Description=Personal blog recovery point and isolated restore verification
After=mongod.service

[Service]
Type=simple
StartLimitInterval=7200
StartLimitBurst=3
UMask=0077
Nice=10
IOSchedulingClass=best-effort
IOSchedulingPriority=7
Environment="PATH=$node_dir:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/usr/bin/python3 $target/snapshot.py daily
Restart=on-failure
RestartSec=15min
EOF
# 较旧的 systemd 仅接受本地时间，先将北京时间换算为主机日历时间。
timer_time=$(date -d "$(TZ=Asia/Shanghai date +%F) 04:15:00 +0800" +%T)
cat >/etc/systemd/system/personal-blog-recovery.timer <<EOF
[Unit]
Description=Daily personal blog recovery point

[Timer]
OnCalendar=*-*-* $timer_time
Persistent=true
Unit=personal-blog-recovery.service

[Install]
WantedBy=timers.target
EOF
chmod 644 /etc/systemd/system/personal-blog-recovery.{service,timer}
systemctl daemon-reload
systemctl enable --now personal-blog-recovery.timer
systemctl list-timers personal-blog-recovery.timer --no-pager
