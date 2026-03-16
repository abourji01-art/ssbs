#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}ELK Stack - Complete Setup${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Start Docker Compose
echo -e "${YELLOW}Step 1: Starting ELK Stack with Docker Compose...${NC}"
docker-compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to start Docker containers${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker containers started${NC}\n"

# Step 2: Wait and setup ILM
echo -e "${YELLOW}Step 2: Configuring log retention policies...${NC}"
sleep 10
./setup-ilm-policy.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to setup ILM policies${NC}"
    exit 1
fi

# Step 3: Setup Kibana
echo -e "\n${YELLOW}Step 3: Configuring Kibana...${NC}"
./setup-kibana.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to setup Kibana${NC}"
    exit 1
fi

# Step 4: Test log ingestion
echo -e "\n${YELLOW}Step 4: Sending test log...${NC}"
echo '{"message": "ELK Stack is ready!", "level": "info", "service": "test"}' | nc localhost 5000

echo -e "${GREEN}✓ Test log sent${NC}\n"

# Display final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓ ELK Stack Setup Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}Quick Commands:${NC}"
echo "  • View logs:      docker-compose logs -f"
echo "  • Stop stack:     docker-compose down"
echo "  • Restart:        docker-compose restart"
echo ""
echo -e "${BLUE}Send logs:${NC}"
echo '  echo '"'"'{"message": "Hello", "level": "info"}'"'"' | nc localhost 5000'
echo ""
echo -e "${BLUE}Check Elasticsearch:${NC}"
echo "  curl -u elastic:changeme http://localhost:9200/_cat/indices?v"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
