"""单机部署的配套备份、隔离还原与按日期保留。备份数据和临时目录仅属主可读。"""
import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import socket
import subprocess
import tempfile
import time


SITE = Path('/www/personal-blog')
STORE = SITE / 'backups' / 'recovery-points'
POINT = re.compile(r'point-\d{8}T\d{6}Z')
DB_NAME = 'personal_fullstack_blog'
DB_URI = 'mongodb://127.0.0.1:27017/' + DB_NAME
RECIPIENT = SITE / 'runtime' / 'recovery' / 'recipient.pem'
AUDIT_RESTORED_DB = """
const a = db.articles.findOne({ deletedAt:null, title:{ $type:'string' },
  $or:[{ contentMarkdown:{ $type:'string', $ne:'' } },{ 'document.extractedText':{ $type:'string',$ne:'' } }] })
const media = db.media.find({ deletedAt: null }, { _id:0, accessScope:1, storageKey:1, storagePath:1, url:1, sha256:1 }).toArray()
print(JSON.stringify({articleReadable: Boolean(a && a.title && (a.contentMarkdown || a.document?.extractedText)), articles:db.articles.countDocuments(),
collections:db.getCollectionNames().sort(), media}))
"""


def run(arguments, **kwargs):
    return subprocess.run([str(arg) for arg in arguments], check=True, **kwargs)


def js_value(arguments, script, *, cwd=None):
    result = run([*arguments, script], cwd=str(cwd) if cwd else None,
                 stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
    return json.loads(result.stdout.strip().splitlines()[-1])


def catalog():
    # 由应用返回当前部署所用的永久目录，配置与加密密钥由服务器另行保管。
    script = """
import {env} from './src/config/env.js'
import {getResourceStorageAreas} from './src/modules/media/services/resourceStorage.service.js'
const areas = getResourceStorageAreas().filter(x => ['public','private','legacy-work-journal'].includes(x.key))
console.log(JSON.stringify({ expectedDatabase:env.mongodbUri === 'mongodb://127.0.0.1:27017/personal_fullstack_blog',
  areas:Object.fromEntries(areas.map(x=>[x.key,x.path])) }))
"""
    config = js_value(['node', '--input-type=module', '-e'], script, cwd=SITE / 'backend')
    # 此发布环境使用本机单实例，拒绝对意外变更的远程或其他目标库执行备份。
    if not config['expectedDatabase']:
        raise ValueError('部署数据库地址与已核准的本机恢复目标不匹配')
    expected = {'public': SITE / 'uploads', 'private': SITE / 'uploads-private',
                'legacy-work-journal': SITE / 'work-journal-private'}
    actual = {name: Path(path).resolve(strict=True) for name, path in config['areas'].items()}
    if actual != expected:
        raise ValueError('永久文件目录已变更，请先核准备份范围')
    return actual


def inventory(areas):
    records = {}
    for name, root in areas.items():
        if not re.fullmatch(r'[a-z][a-z-]*', name) or not root.is_dir():
            raise ValueError('永久文件目录无效')
        for path in root.rglob('*'):
            if path.is_symlink() or not (path.is_dir() or path.is_file()):
                raise ValueError('永久目录内有需人工核准的链接或特殊文件')
            if path.is_file():
                stat = path.stat()
                records[(name, path.relative_to(root))] = (stat.st_size, stat.st_ctime_ns, stat.st_ino)
    return records


def digest(path):
    value = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            value.update(block)
    return value.hexdigest()


def mongo(script):
    return js_value(['mongosh', DB_URI, '--quiet', '--eval'], script)


def db_state():
    return mongo("""
const result = db.runCommand({ dbHash: 1 })
if (result.ok !== 1) throw Error('数据库校验失败')
print(JSON.stringify({ hash: result.md5, collections: result.collections }))
""")


def create_point():
    areas = catalog()
    stamp = dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    point = STORE / ('point-' + stamp)
    with tempfile.TemporaryDirectory(prefix='.create-', dir=STORE) as temporary:
        work = Path(temporary)
        data = work / 'data'
        data.mkdir()
        before = inventory(areas)
        state = db_state()
        run(['mongodump', '--uri', DB_URI, '--gzip', '--numParallelCollections=1',
             '--archive=' + str(data / 'database.gz')], stderr=subprocess.DEVNULL)
        for name, path in areas.items():
            shutil.copytree(path, data / name, symlinks=True)
        # 小型单实例在复制前后对比数据库内容和原件版本。写入撞上窗口则放弃本次候选点。
        copied = inventory({name: data / name for name in areas})
        if before.keys() != copied.keys() or before != inventory(areas) or state != db_state():
            raise RuntimeError('复制期间发生写入，未发布候选恢复点，请重试')
        files = {str(Path(name) / part): digest(data / name / part) for name, part in before}
        manifest = dict(version=1, point=point.name, database=DB_NAME, collections=sorted(state['collections']),
                        areas={name: str(path) for name, path in areas.items()}, files=files)
        (data / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False), encoding='utf-8')
        out = work / 'complete'
        out.mkdir()
        archive = out / 'data.tar.gz'
        run(['tar', '-czf', archive, '-C', data, '.'])
        (out / 'sha256').write_text(digest(archive) + '\n', encoding='ascii')
        out.rename(point)
    print(point.name, 'files=' + str(len(files)), 'collections=' + str(len(state['collections'])), flush=True)
    return point


def check_point(name):
    if not POINT.fullmatch(name):
        raise ValueError('恢复点名称无效')
    point = STORE / name
    if point.is_symlink() or not point.is_dir() or point.resolve().parent != STORE.resolve():
        raise ValueError('恢复点路径无效')
    return point


def seal(point):
    """仅封装已演练恢复点，服务端保留公钥，解密密钥由异机保管。"""
    archive = point / 'data.tar.gz'
    expected = (point / 'sha256').read_text().strip()
    report = json.loads((point / 'verified.json').read_text())
    if report['point'] != point.name or digest(archive) != expected:
        raise ValueError('恢复点与还原记录不对应')
    with tempfile.TemporaryDirectory(prefix='.seal-', dir=point) as temporary:
        sealed = Path(temporary) / 'data.cms'
        # OpenSSL 1.1.1 的 CMS 支持 AES-CBC；接收端使用经 SSH 核准的原始归档摘要验证完整性。
        run(['openssl', 'cms', '-encrypt', '-binary', '-stream', '-aes256', '-outform', 'DER',
             '-in', archive, '-out', sealed, RECIPIENT])
        sealed.replace(point / 'data.cms')
    (point / 'sealed.sha256').write_text(expected + '\n', encoding='ascii')
    latest = STORE / 'latest-sealed'
    if not latest.is_file() or latest.read_text().strip() <= point.name:
        marker = STORE / '.latest-sealed.tmp'
        marker.write_text(point.name + '\n', encoding='ascii')
        marker.replace(latest)
    print(point.name + ' encrypted')


def check_media_samples(media_rows, manifest):
    samples = set()
    expected_scopes = set()
    for media in media_rows:
        scope = media.get('accessScope', 'public')
        if scope not in ('public', 'private', 'vault'):
            continue
        expected_scopes.add(scope)
        if scope in samples:
            continue
        # 历史简历照片在 public/resumes，归属由 accessScope 标识。演练只比对受管原件的摘要。
        storage_key = media.get('storageKey') or ''
        paths = [storage_key] if storage_key else []
        if not storage_key:
            path = Path(media.get('storagePath') or '')
            for area, original in manifest['areas'].items():
                if Path(original) in path.parents:
                    paths.append((Path(area) / path.relative_to(original)).as_posix())
            if scope == 'public' and str(media.get('url', '')).startswith('/uploads/'):
                paths.append('public/' + media['url'][9:])
        for candidate in paths:
            area = candidate.partition('/')[0]
            original_hash = media.get('sha256')
            digest_in_manifest = manifest['files'].get(candidate)
            if area in manifest['areas'] and digest_in_manifest and (not original_hash or original_hash == digest_in_manifest):
                samples.add(scope)
                break
    if expected_scopes != samples:
        raise RuntimeError('未能核验以下范围的已还原文件样本 ' + ', '.join(sorted(expected_scopes - samples)))
    return sorted(samples)


def restore_in_namespace(point):
    if os.readlink('/proc/self/ns/net') == os.readlink('/proc/1/ns/net'):
        raise RuntimeError('演练必须在独立网络命名空间中执行')
    archive = point / 'data.tar.gz'
    if digest(archive) != (point / 'sha256').read_text().strip():
        raise RuntimeError('归档摘要不匹配')
    started = time.monotonic()
    with tempfile.TemporaryDirectory(prefix='.drill-', dir=STORE) as temporary:
        root = Path(temporary)
        data = root / 'data'
        database = root / 'db'
        data.mkdir()
        database.mkdir()
        run(['tar', '-xzf', archive, '-C', data])
        manifest = json.loads((data / 'manifest.json').read_text(encoding='utf-8'))
        for name, expected in manifest['files'].items():
            target = (data / name).resolve()
            if data not in target.parents or target.is_symlink() or digest(target) != expected:
                raise RuntimeError('还原文件与恢复清单不匹配')
        with (root / 'mongo.log').open('wb') as log:
            server = subprocess.Popen(['mongod', '--dbpath', str(database), '--bind_ip', '127.0.0.1',
                                       '--port', '27017', '--nounixsocket', '--wiredTigerCacheSizeGB', '0.25'],
                                      stdout=log, stderr=subprocess.STDOUT)
            try:
                for _ in range(40):
                    if server.poll() is not None:
                        raise RuntimeError('演练实例未能启动')
                    try:
                        with socket.create_connection(('127.0.0.1', 27017), timeout=0.3):
                            break
                    except OSError:
                        time.sleep(0.25)
                else:
                    raise RuntimeError('演练实例启动超时')
                run(['mongorestore', '--uri', DB_URI, '--gzip', '--stopOnError', '--numParallelCollections=1',
                     '--archive=' + str(data / 'database.gz')], stderr=subprocess.DEVNULL)
                audit = mongo(AUDIT_RESTORED_DB)
            finally:
                server.terminate()
                try:
                    server.wait(timeout=60)
                except subprocess.TimeoutExpired:
                    server.kill()
                    server.wait()
        if not audit['articleReadable'] or not set(manifest['collections']).issubset(audit['collections']):
            raise RuntimeError('文章或集合恢复核验失败')
        samples = check_media_samples(audit['media'], manifest)
        report = dict(point=point.name, articles=audit['articles'], collections=len(audit['collections']),
                      files=len(manifest['files']), mediaSamples=sorted(samples), elapsedSeconds=round(time.monotonic() - started, 1))
        tmp = point / '.verified.tmp'
        tmp.write_text(json.dumps(report) + '\n')
        tmp.replace(point / 'verified.json')
        print(json.dumps(report))


def expire_points(apply):
    verified = []
    for point in sorted(STORE.iterdir(), reverse=True):
        if not POINT.fullmatch(point.name) or point.is_symlink() or not point.is_dir():
            continue
        report = point / 'verified.json'
        if not report.is_file() or not (point / 'data.tar.gz').is_file() or not (point / 'sha256').is_file():
            continue
        ready = (point / 'data.cms').is_file() or (point / 'sealed.sha256').is_file()
        if ready and json.loads(report.read_text()).get('point') == point.name:
            verified.append(point)
    if not verified:
        return
    latest = verified[0]
    # 保留最近两个不同日期的点。同日多次演练时，优先保留上一日的可还原数据。
    previous = next((p for p in verified[1:] if p.name[:14] != latest.name[:14]),
                    verified[1] if len(verified) > 1 else None)
    for point in verified[1:]:
        if point == previous:
            sealed = point / 'data.cms'
            if sealed.is_file() and (latest / 'data.cms').is_file():
                print(('remove ' if apply else 'candidate ') + point.name + '/data.cms')
                if apply:
                    marker = point / 'sealed.sha256'
                    if not marker.exists():
                        marker.write_text((point / 'sha256').read_text(), encoding='ascii')
                    sealed.unlink()
            continue
        print(('remove ' if apply else 'candidate ') + point.name)
        if apply:
            shutil.rmtree(check_point(point.name))


def main():
    import fcntl
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['create', 'verify', 'seal', 'daily', 'prune', '_isolated'])
    parser.add_argument('point', nargs='?')
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    os.umask(0o077)
    STORE.mkdir(parents=True, exist_ok=True, mode=0o700)
    if args.action == '_isolated':
        restore_in_namespace(check_point(args.point or ''))
        return
    with (STORE / '.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        if args.action == 'prune':
            expire_points(args.apply)
            return
        if args.action == 'seal':
            seal(check_point(args.point or ''))
            return
        point = check_point(args.point or '') if args.action == 'verify' else create_point()
        try:
            if args.action in ('daily', 'verify'):
                run(['unshare', '--net', 'sh', '-ec', 'ip link set lo up && exec python3 "$1" _isolated "$2"',
                     'drill', str(Path(__file__).resolve()), point.name])
            if args.action == 'daily':
                seal(point)
        except Exception:
            # 定时重试仅回收本次新建的失败候选；对手工指定恢复点的核验保留原始现场。
            if args.action == 'daily':
                shutil.rmtree(check_point(point.name))
            raise
        if args.action == 'daily':
            expire_points(True)


if __name__ == '__main__':
    main()
