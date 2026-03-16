#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up SSL certificates with mkcert...${NC}\n"

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo -e "${RED}mkcert is not installed. Installing...${NC}"
    
    # Detect OS and install mkcert
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
            sudo apt update
            sudo apt install -y libnss3-tools
            curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
            chmod +x mkcert-v*-linux-amd64
            sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
        elif command -v yum &> /dev/null; then
            sudo yum install -y nss-tools
            curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
            chmod +x mkcert-v*-linux-amd64
            sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install mkcert nss
    fi
    
    echo -e "${GREEN}✓ mkcert installed!${NC}\n"
fi

# Install local CA
echo -e "${YELLOW}Installing local CA...${NC}"
mkcert -install
echo -e "${GREEN}✓ Local CA installed!${NC}\n"

# Create certs directory structure
mkdir -p certs/elasticsearch
mkdir -p certs/kibana
mkdir -p certs/logstash

# Generate certificates
echo -e "${YELLOW}Generating certificates...${NC}"

# Elasticsearch certificate
cd certs/elasticsearch
mkcert -cert-file elasticsearch.crt -key-file elasticsearch.key \
    localhost 127.0.0.1 elasticsearch ::1
cd ../..
echo -e "${GREEN}✓ Elasticsearch certificate created${NC}"

# Kibana certificate
cd certs/kibana
mkcert -cert-file kibana.crt -key-file kibana.key \
    localhost 127.0.0.1 kibana ::1
cd ../..
echo -e "${GREEN}✓ Kibana certificate created${NC}"

# Logstash certificate
cd certs/logstash
mkcert -cert-file logstash.crt -key-file logstash.key \
    localhost 127.0.0.1 logstash ::1
cd ../..
echo -e "${GREEN}✓ Logstash certificate created${NC}"

# Copy CA certificate to each service directory
cp "$(mkcert -CAROOT)/rootCA.pem" certs/elasticsearch/ca.crt
cp "$(mkcert -CAROOT)/rootCA.pem" certs/kibana/ca.crt
cp "$(mkcert -CAROOT)/rootCA.pem" certs/logstash/ca.crt

echo -e "${GREEN}✓ CA certificates copied${NC}\n"

# Set proper permissions
chmod 644 certs/*/*.crt
chmod 644 certs/*/*.pem
chmod 600 certs/*/*.key

echo -e "${GREEN}✓ Permissions set correctly${NC}\n"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}SSL Certificates Setup Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Certificates created in:"
echo "  • certs/elasticsearch/"
echo "  • certs/kibana/"
echo "  • certs/logstash/"
echo ""
echo "Next steps:"
echo "  1. Update docker-compose.yml to use SSL"
echo "  2. Update Elasticsearch configuration"
echo "  3. Update Kibana configuration"
echo "  4. Update Logstash configuration"
echo "  5. Restart the ELK stack"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
