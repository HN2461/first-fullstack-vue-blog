"""仅取回服务器已演练的加密归档，并在开发机流式解密核验摘要。"""
import argparse
import json
from pathlib import Path
import re
import shutil
import tempfile

from key import LOCAL, decrypt_archive, ensure_recipient


def receive(fetch, point_name=None):
    ensure_recipient()
    with tempfile.TemporaryDirectory(dir=LOCAL, prefix='.pull-') as temporary:
        staging = Path(temporary)
        if point_name is None:
            latest = staging / 'latest'
            fetch('latest-sealed', latest)
            point_name = latest.read_text(encoding='ascii').strip()
        if not re.fullmatch(r'point-\d{8}T\d{6}Z', point_name):
            raise ValueError('恢复点名称不合法')
        completed = LOCAL / point_name
        incoming = staging / point_name
        incoming.mkdir()
        for name in ('verified.json', 'sha256'):
            fetch(f'{point_name}/{name}', incoming / name)
        expected = (incoming / 'sha256').read_text(encoding='ascii').strip()
        report = json.loads((incoming / 'verified.json').read_text(encoding='utf-8'))
        if report.get('point') != point_name or not re.fullmatch('[0-9a-f]{64}', expected):
            raise ValueError('校验记录与恢复点不一致')
        if completed.exists():
            if completed.is_symlink() or not completed.is_dir():
                raise ValueError('本地恢复点路径不是受管目录')
            archive = completed / 'data.cms'
        else:
            archive = incoming / 'data.cms'
            fetch(f'{point_name}/data.cms', archive)
        if decrypt_archive(archive) != expected:
            raise ValueError('异机解密结果与服务器还原演练的归档摘要不一致')
        if not completed.exists():
            incoming.rename(completed)
        print(f'{point_name} {archive.name} 已通过解密与 SHA-256 核验')
        return completed


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    location = parser.add_mutually_exclusive_group(required=True)
    location.add_argument('--source', type=Path, help='已挂载或复制到本机、带 latest-sealed 的目录')
    location.add_argument('--sftp', metavar='USER@HOST', help='使用 OpenSSH 身份和已登记主机密钥读取备份目录')
    parser.add_argument('--point', help='默认读取最新通过演练的恢复点')
    args = parser.parse_args()
    if args.source:
        receive(lambda path, dest: shutil.copyfile(args.source / path, dest), args.point)
        return
    import subprocess
    if not re.fullmatch(r'[a-zA-Z0-9_][a-zA-Z0-9_.@-]*', args.sftp):
        raise ValueError('SSH 目标无效')
    remote = '/www/personal-blog/backups/recovery-points'
    def fetch(path, destination):
        subprocess.run(['scp', '-B', '-oStrictHostKeyChecking=yes', f'{args.sftp}:{remote}/{path}', str(destination)], check=True)
    receive(fetch, args.point)


if __name__ == '__main__':
    main()
