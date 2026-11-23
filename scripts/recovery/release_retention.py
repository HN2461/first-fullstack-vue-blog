"""在公网验收与发布时间写入成功后，分别保留前端、后端最近两次程序回退副本。"""
import json
from pathlib import Path
import re
import shutil
import sys


TARGETS = {'frontend': ('frontend',), 'backend': ('backend',), 'full': ('frontend', 'backend')}
MARKER = 'release-success.json'
ENTRIES = {MARKER, 'frontend-before', 'frontend-current', 'backend-before', 'backend.env.before-release',
           'mongodb-before', 'personal-blog.nginx.before-release.conf', 'uploads-before',
           'uploads-private-before', 'work-journal-private-before'}


def rollback_targets(path):
    """根据成功标记及实际回退材料识别发布目录，结构异常的副本留待人工核对。"""
    if not re.fullmatch(r'release-\d{8}-\d{6}', path.name) or path.is_symlink() or not path.is_dir():
        return ()
    marker = path / MARKER
    if not marker.is_file() or marker.is_symlink():
        return ()
    try:
        data = json.loads(marker.read_text(encoding='utf-8'))
    except (OSError, ValueError):
        return ()
    if not isinstance(data, dict) or data.get('releaseId') != path.name[8:]:
        return ()
    targets = TARGETS.get(data.get('target'), ()) if isinstance(data.get('target'), str) else ()
    if any(child.name not in ENTRIES or child.is_symlink() for child in path.iterdir()):
        return ()
    for kind in ('frontend', 'backend'):
        artifact = path / (kind + '-before')
        if (kind in targets) != artifact.is_dir():
            return ()
        if kind in targets:
            entrypoint = artifact / ('index.html' if kind == 'frontend' else 'package.json')
            if entrypoint.is_symlink() or not entrypoint.is_file() or entrypoint.stat().st_size == 0:
                return ()
    return targets


def rotate(root, release_id, target):
    if not re.fullmatch(r'\d{8}-\d{6}', release_id) or target not in TARGETS or root.resolve() != root:
        raise ValueError('程序回退目录或发布标识无效')
    current = root / ('release-' + release_id)
    if current.resolve() != current or not current.is_dir():
        raise ValueError('本次回退目录无效')
    marker = current / MARKER
    temporary = current / (MARKER + '.tmp')
    with temporary.open('x', encoding='utf-8') as stream:
        json.dump({'releaseId': release_id, 'target': target}, stream)
    temporary.replace(marker)
    if not rollback_targets(current):
        raise ValueError('本次回退材料不完整，已保留历史副本')
    releases = [(path, rollback_targets(path)) for path in sorted(root.iterdir(), reverse=True)]
    keep = {current}
    for kind in ('frontend', 'backend'):
        keep.update([path for path, targets in releases if kind in targets][:2])
    for path, targets in releases:
        if targets and path not in keep and path.resolve().parent == root:
            shutil.rmtree(str(path))
            print('REMOVED_ROLLBACK=' + path.name)


if __name__ == '__main__':
    import fcntl
    root = Path('/www/personal-blog/backups')
    with (root / '.release-retention.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        rotate(root, *sys.argv[1:])
