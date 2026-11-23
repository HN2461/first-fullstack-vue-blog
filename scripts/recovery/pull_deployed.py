"""从部署服务器限次重试、断点取回最近已演练的密文，按业务日期保留开发机副本。"""
import hashlib
import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
import re
import shutil
import time

import paramiko

from key import LOCAL
from pull import receive


REMOTE = '/www/personal-blog/backups/recovery-points/'
POINT = re.compile(r'point-\d{8}T\d{6}Z')


def connect():
    """用部署配置中的身份和本机已登记的主机密钥连接，未知或变更的服务器会被拒绝。"""
    client = paramiko.SSHClient()
    client.load_system_host_keys()
    client.set_missing_host_key_policy(paramiko.RejectPolicy())
    client.connect(os.environ['DEPLOY_HOST'], username=os.environ['DEPLOY_USER'],
                   password=os.environ['DEPLOY_PASSWORD'], timeout=20, banner_timeout=20, auth_timeout=20)
    client.get_transport().set_keepalive(15)
    return client


def retry(operation):
    for attempt in range(4):
        try:
            return operation()
        except (paramiko.AuthenticationException, paramiko.BadHostKeyException):
            raise
        except (OSError, EOFError, paramiko.SSHException):
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)


def fetch(remote_name, destination):
    """向 receive 提供已校验的相对路径文件。大归档以远端密文摘要命名，重新封装时自动另起续传。"""
    def download():
        with connect() as client, client.open_sftp() as sftp:
            sftp.get_channel().settimeout(60)
            path = REMOTE + remote_name
            if not remote_name.endswith('/data.cms'):
                sftp.get(path, str(destination))
                return
            point, _ = remote_name.split('/')
            if not POINT.fullmatch(point):
                raise ValueError('恢复点名称无效')
            _, output, _ = client.exec_command('sha256sum -- ' + path, timeout=60)
            checksum = output.readline().split()
            if output.channel.recv_exit_status() or not checksum or not re.fullmatch('[a-f0-9]{64}', checksum[0]):
                raise ValueError('未能获取远端密文摘要')
            partial = LOCAL / ('.partial-' + point + '-' + checksum[0])
            if partial.is_symlink() or (partial.exists() and not partial.is_file()):
                raise ValueError('续传位置异常')
            size = sftp.stat(path).st_size
            offset = partial.stat().st_size if partial.exists() else 0
            if offset > size:
                raise ValueError('续传数据超出远端文件大小')
            # 每次网络重连只读取尚缺部分，数据直接写入磁盘，全程仅持久化密文。
            with partial.open('ab') as dest, sftp.open(path, 'rb') as source:
                source.seek(offset)
                source.prefetch(file_size=size, max_concurrent_requests=16)
                while offset < size:
                    chunk = source.read(min(512 * 1024, size - offset))
                    if not chunk:
                        raise EOFError('密文传输提前结束')
                    dest.write(chunk)
                    offset += len(chunk)
            with partial.open('rb') as stream:
                verified = hashlib.file_digest(stream, 'sha256').hexdigest()
            if verified != checksum[0]:
                partial.unlink()
                raise IOError('续传密文摘要校验失败')
            shutil.copyfile(partial, destination)
            return partial
    return retry(download)


def prune(completed):
    """在新点解密核验完成后，保留最近七个上海日期各自最新的已完成副本。"""
    dates = set()
    for path in sorted(LOCAL.iterdir(), reverse=True):
        if not POINT.fullmatch(path.name) or path.is_symlink() or path.resolve().parent != LOCAL.resolve():
            continue
        if not path.is_dir() or {p.name for p in path.iterdir()} != {'data.cms', 'verified.json', 'sha256'}:
            continue
        if any(p.is_symlink() or not p.is_file() for p in path.iterdir()):
            continue
        report = json.loads((path / 'verified.json').read_text(encoding='utf-8'))
        if report.get('point') != path.name:
            continue
        stamp = datetime.strptime(path.name, 'point-%Y%m%dT%H%M%SZ').replace(tzinfo=timezone.utc)
        day = stamp.astimezone(timezone(timedelta(hours=8))).date()
        if day not in dates and len(dates) < 7:
            dates.add(day)
        elif path != completed:
            shutil.rmtree(path)


def main():
    resumable = []

    def copy(name, dest):
        partial = fetch(name, dest)
        if partial:
            resumable.append(partial)

    completed = receive(copy)
    for partial in resumable:
        partial.unlink(missing_ok=True)
    prune(completed)


if __name__ == '__main__':
    main()
