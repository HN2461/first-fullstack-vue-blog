"""开发机保管解密密钥，服务器只接收公开证书。"""
import ctypes
import hashlib
import os
import shutil
import subprocess
import tempfile
from ctypes import wintypes
from datetime import datetime, timedelta, timezone
from pathlib import Path

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID


LOCAL = Path(__file__).resolve().parents[2] / 'backups' / 'recovery'
KEY = Path(os.environ['LOCALAPPDATA']) / 'PersonalBlogRecovery' / 'key.dpapi'
CERT = LOCAL / 'recipient.pem'


class Blob(ctypes.Structure):
    _fields_ = [('length', wintypes.DWORD), ('data', ctypes.c_void_p)]


def dpapi(value, *, decrypt=False):
    source = ctypes.create_string_buffer(value)
    incoming = Blob(len(value), ctypes.cast(source, ctypes.c_void_p))
    outgoing = Blob()
    operation = ctypes.windll.crypt32.CryptUnprotectData if decrypt else ctypes.windll.crypt32.CryptProtectData
    if not operation(ctypes.byref(incoming), None, None, None, None, 1, ctypes.byref(outgoing)):
        raise ctypes.WinError()
    try:
        return ctypes.string_at(outgoing.data, outgoing.length)
    finally:
        ctypes.windll.kernel32.LocalFree(ctypes.c_void_p(outgoing.data))


def ensure_recipient():
    LOCAL.mkdir(parents=True, exist_ok=True)
    KEY.parent.mkdir(parents=True, exist_ok=True)
    if KEY.exists():
        private = serialization.load_pem_private_key(dpapi(KEY.read_bytes(), decrypt=True), password=None)
    elif CERT.exists():
        raise RuntimeError('本机原私钥缺失，不能为既有证书重新生成密钥')
    else:
        private = rsa.generate_private_key(public_exponent=65537, key_size=3072)
        encrypted = dpapi(private.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))
        with KEY.open('xb') as stream:
            stream.write(encrypted)
    if CERT.exists():
        public = x509.load_pem_x509_certificate(CERT.read_bytes()).public_key()
        if public.public_numbers() != private.public_key().public_numbers():
            raise RuntimeError('本机私钥与归档证书不匹配')
        return CERT
    name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, 'personal-blog-recovery')])
    now = datetime.now(timezone.utc)
    cert = (x509.CertificateBuilder().subject_name(name).issuer_name(name)
            .public_key(private.public_key()).serial_number(x509.random_serial_number())
            .not_valid_before(now - timedelta(minutes=5)).not_valid_after(now + timedelta(days=3650))
            .sign(private, hashes.SHA256()))
    CERT.write_bytes(cert.public_bytes(serialization.Encoding.PEM))
    return CERT


def decrypt_archive(archive, output=None):
    """校验解密流并返回明文 SHA-256。仅在显式提供 output 时保留明文。"""
    ensure_recipient()
    openssl = shutil.which('openssl')
    if not openssl:
        openssl = Path(shutil.which('git')).resolve().parents[1] / 'usr' / 'bin' / 'openssl.exe'
    # OpenSSL for Windows 通过文件加载私钥。临时文件使用一次性密码加密，密码只经匿名管道传递。
    private = serialization.load_pem_private_key(dpapi(KEY.read_bytes(), decrypt=True), password=None)
    password = os.urandom(32).hex().encode()
    with tempfile.TemporaryDirectory() as temporary:
        protected = Path(temporary) / 'key.pem'
        protected.write_bytes(private.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8,
                                                    serialization.BestAvailableEncryption(password)))
        args = [openssl, 'cms', '-decrypt', '-binary', '-inform', 'DER',
                '-in', archive, '-recip', CERT, '-inkey', protected, '-passin', 'stdin']
        with subprocess.Popen(args, stdin=subprocess.PIPE, stdout=subprocess.PIPE) as decryptor:
            decryptor.stdin.write(password + b'\n')
            decryptor.stdin.close()
            value = hashlib.sha256()
            with (Path(output).open('xb') if output else open(os.devnull, 'wb')) as target:
                for block in iter(lambda: decryptor.stdout.read(1024 * 1024), b''):
                    target.write(block)
                    value.update(block)
            if decryptor.wait() != 0:
                if output:
                    Path(output).unlink(missing_ok=True)
                raise ValueError('归档解密或密文认证失败')
            return value.hexdigest()


if __name__ == '__main__':
    print(ensure_recipient())
