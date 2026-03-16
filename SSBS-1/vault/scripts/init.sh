#!/bin/sh
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Vault Init Script
# Initializes Vault, unseals it, creates policies, and seeds all SSBS secrets.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VAULT_ADDR="http://vault:8200"
VAULT_KEYS_FILE="/vault/data/init-keys.json"
export VAULT_ADDR

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Vault Init — Waiting for Vault to start..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Wait for Vault to be reachable (vault status exits 1=error, 2=sealed, 0=ok)
RETRIES=0
while true; do
    RETRIES=$((RETRIES + 1))
    if [ "$RETRIES" -gt 30 ]; then
        echo "ERROR: Vault not reachable after 60s. Exiting."
        exit 1
    fi
    # vault status returns 2 when sealed/not-init, 0 when ok — both mean it's up
    vault status -address="$VAULT_ADDR" > /dev/null 2>&1
    RC=$?
    if [ "$RC" -eq 0 ] || [ "$RC" -eq 2 ]; then
        break
    fi
    echo "  ... Vault not ready yet (rc=$RC). Retrying in 2s."
    sleep 2
done

echo "Vault is reachable."

# ── Step 1: Initialize Vault (only on first run) ──────────────────────────────
vault status -address="$VAULT_ADDR" -format=json 2>/dev/null | grep -q '"initialized": false' || true
IS_INIT=$(vault status -address="$VAULT_ADDR" -format=json 2>/dev/null | grep '"initialized"' | grep -c 'false')

if [ "$IS_INIT" -eq 1 ]; then
    echo "Initializing Vault (1 key share, threshold 1)..."
    vault operator init -key-shares=1 -key-threshold=1 -format=json > "$VAULT_KEYS_FILE"
    echo "Vault initialized. Keys stored at $VAULT_KEYS_FILE"
else
    echo "Vault already initialized."
fi

# ── Step 2: Extract keys using grep/sed (no python3/jq needed) ───────────────
# Flatten to single line and remove all whitespace for reliable extraction
FLAT_JSON=$(tr -d '\n\r\t ' < "$VAULT_KEYS_FILE")
# Extract unseal key (first entry in unseal_keys_b64 array)
UNSEAL_KEY=$(echo "$FLAT_JSON" | sed 's/.*"unseal_keys_b64":\["\([^"]*\)".*/\1/')
# Extract root token
ROOT_TOKEN=$(echo "$FLAT_JSON" | sed 's/.*"root_token":"\([^"]*\)".*/\1/')

if [ -z "$UNSEAL_KEY" ] || [ -z "$ROOT_TOKEN" ]; then
    echo "ERROR: Could not extract keys from $VAULT_KEYS_FILE"
    cat "$VAULT_KEYS_FILE"
    exit 1
fi

# ── Step 3: Unseal Vault ─────────────────────────────────────────────────────
IS_SEALED=$(vault status -address="$VAULT_ADDR" -format=json 2>/dev/null | grep '"sealed"' | grep -c 'true')

if [ "$IS_SEALED" -eq 1 ]; then
    echo "Unsealing Vault..."
    vault operator unseal "$UNSEAL_KEY"
    echo "Vault unsealed."
else
    echo "Vault already unsealed."
fi

# ── Step 4: Authenticate ─────────────────────────────────────────────────────
export VAULT_TOKEN="$ROOT_TOKEN"
echo "Authenticated with root token."

# ── Step 5: Enable KV v2 secrets engine ──────────────────────────────────────
if ! vault secrets list -address="$VAULT_ADDR" 2>/dev/null | grep -q "^secret/"; then
    echo "Enabling KV v2 secrets engine at secret/..."
    vault secrets enable -path=secret kv-v2
    echo "KV v2 enabled."
else
    echo "KV v2 already enabled at secret/."
fi

# ── Step 6: Write the backend policy ─────────────────────────────────────────
echo "Writing backend policy..."
vault policy write ssbs-backend /vault/policies/ssbs-backend.hcl
echo "Policy 'ssbs-backend' written."

# ── Step 7: Create AppRole for backend ────────────────────────────────────────
if ! vault auth list -address="$VAULT_ADDR" 2>/dev/null | grep -q "^approle/"; then
    echo "Enabling AppRole auth method..."
    vault auth enable approle
fi

vault write auth/approle/role/ssbs-backend \
    token_policies="ssbs-backend" \
    token_ttl=1h \
    token_max_ttl=4h \
    secret_id_ttl=0

echo "AppRole 'ssbs-backend' configured."

# Get the Role ID and Secret ID for the backend
ROLE_ID=$(vault read -field=role_id auth/approle/role/ssbs-backend/role-id)
SECRET_ID=$(vault write -f -field=secret_id auth/approle/role/ssbs-backend/secret-id)

# ── Step 8: Seed all SSBS secrets ─────────────────────────────────────────────
echo "Seeding secrets into Vault..."

# Database secrets
vault kv put secret/ssbs/database \
    host="${DB_HOST:-db}" \
    port="${DB_PORT:-5432}" \
    name="${POSTGRES_DB:-ssbs_db}" \
    user="${POSTGRES_USER:-ssbs_user}" \
    password="${POSTGRES_PASSWORD:-changeme}"

# Django secrets
vault kv put secret/ssbs/django \
    secret_key="${SECRET_KEY:-your-super-secret-key-change-this-in-production}" \
    debug="${APP_DEBUG:-false}" \
    allowed_hosts="${ALLOWED_HOSTS:-*}"

# JWT secrets
vault kv put secret/ssbs/jwt \
    secret="${JWT_SECRET:-your-jwt-secret-key-change-this}" \
    expiration="${JWT_EXPIRATION:-24h}"

# 42 OAuth secrets
vault kv put secret/ssbs/oauth42 \
    client_id="${INTRA_42_CLIENT_ID:-}" \
    client_secret="${INTRA_42_CLIENT_SECRET:-}" \
    redirect_uri="${INTRA_42_REDIRECT_URI:-http://localhost:5173/auth/callback}" \
    admin_login="${ADMIN_42_LOGIN:-}"

# API key
vault kv put secret/ssbs/api \
    key="${SSBS_API_KEY:-}"

# Store AppRole credentials for backend to use
vault kv put secret/ssbs/approle \
    role_id="$ROLE_ID" \
    secret_id="$SECRET_ID"

echo "All secrets seeded."

# ── Step 9: Write AppRole credentials to shared volume ────────────────────────
echo "Writing AppRole credentials for backend..."
mkdir -p /vault/approle
echo "$ROLE_ID" > /vault/approle/role-id
echo "$SECRET_ID" > /vault/approle/secret-id
echo "$ROOT_TOKEN" > /vault/approle/root-token
chmod 600 /vault/approle/*

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Vault initialization complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Vault UI:    ${VAULT_ADDR}/ui"
echo " Root Token:  $ROOT_TOKEN"
echo " Role ID:     $ROLE_ID"
echo " Secret ID:   $SECRET_ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
