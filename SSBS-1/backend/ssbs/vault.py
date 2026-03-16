"""
Vault client for SSBS backend.
Reads secrets from HashiCorp Vault using AppRole authentication.
Falls back to environment variables if Vault is unavailable.
"""
import os
import logging

logger = logging.getLogger(__name__)

_vault_client = None
_secrets_cache = {}


def _get_vault_client():
    """Get an authenticated Vault client using AppRole credentials."""
    global _vault_client
    if _vault_client is not None:
        return _vault_client

    try:
        import hvac
    except ImportError:
        logger.warning("hvac not installed — Vault integration disabled")
        return None

    vault_addr = os.environ.get('VAULT_ADDR', 'http://vault:8200')

    # Try AppRole file-based auth first (written by vault-init)
    role_id = None
    secret_id = None
    approle_dir = os.environ.get('VAULT_APPROLE_DIR', '/vault/approle')

    role_id_file = os.path.join(approle_dir, 'role-id')
    secret_id_file = os.path.join(approle_dir, 'secret-id')

    if os.path.isfile(role_id_file) and os.path.isfile(secret_id_file):
        with open(role_id_file) as f:
            role_id = f.read().strip()
        with open(secret_id_file) as f:
            secret_id = f.read().strip()

    # Fallback to env vars
    if not role_id:
        role_id = os.environ.get('VAULT_ROLE_ID')
    if not secret_id:
        secret_id = os.environ.get('VAULT_SECRET_ID')

    if not role_id or not secret_id:
        logger.warning("No Vault AppRole credentials found — Vault disabled")
        return None

    try:
        client = hvac.Client(url=vault_addr)
        client.auth.approle.login(role_id=role_id, secret_id=secret_id)
        if client.is_authenticated():
            logger.info("Authenticated with Vault via AppRole")
            _vault_client = client
            return client
        else:
            logger.warning("Vault authentication failed")
            return None
    except Exception as e:
        logger.warning("Could not connect to Vault: %s", e)
        return None


def get_secret(path, key, default=None):
    """
    Read a secret from Vault KV v2 at secret/ssbs/<path>, field <key>.
    Falls back to `default` if Vault is unavailable.

    Usage:
        get_secret('database', 'password', 'fallback')
        get_secret('django', 'secret_key')
    """
    cache_key = f"{path}/{key}"
    if cache_key in _secrets_cache:
        return _secrets_cache[cache_key]

    client = _get_vault_client()
    if client is None:
        return default

    try:
        result = client.secrets.kv.v2.read_secret_version(
            path=f"ssbs/{path}",
            mount_point="secret",
        )
        value = result['data']['data'].get(key, default)
        _secrets_cache[cache_key] = value
        return value
    except Exception as e:
        logger.warning("Failed to read Vault secret %s/%s: %s", path, key, e)
        return default


def get_all_secrets(path):
    """
    Read all key-value pairs from a Vault path.
    Returns a dict, or empty dict on failure.
    """
    client = _get_vault_client()
    if client is None:
        return {}

    try:
        result = client.secrets.kv.v2.read_secret_version(
            path=f"ssbs/{path}",
            mount_point="secret",
        )
        return result['data']['data']
    except Exception as e:
        logger.warning("Failed to read Vault secrets at %s: %s", path, e)
        return {}
