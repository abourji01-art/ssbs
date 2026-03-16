#!/bin/sh
# Generate self-signed SSL certificate for WAF
set -e

SSL_DIR="$(dirname "$0")/ssl"
mkdir -p "$SSL_DIR"

if [ -f "$SSL_DIR/cert.pem" ] && [ -f "$SSL_DIR/key.pem" ]; then
    echo "SSL certificates already exist, skipping generation."
    exit 0
fi

openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout "$SSL_DIR/key.pem" \
    -out "$SSL_DIR/cert.pem" \
    -subj "/C=MA/ST=Casablanca/L=Casablanca/O=42/OU=SSBS/CN=localhost"

echo "SSL certificates generated in $SSL_DIR/"
