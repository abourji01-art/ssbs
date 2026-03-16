#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Waiting for Kibana to be ready...${NC}"
until curl -s http://localhost:5601/api/status | grep -q '"level":"available"'; do
  echo "Waiting..."
  sleep 5
done

echo -e "${GREEN}✓ Kibana is ready!${NC}\n"

# Create index pattern for logstash logs
echo -e "${YELLOW}Creating Kibana index pattern...${NC}"
curl -X POST "http://localhost:5601/api/saved_objects/index-pattern/logstash-*" \
  -u elastic:changeme \
  -H 'kbn-xsrf: true' \
  -H 'Content-Type: application/json' \
  -d '{
  "attributes": {
    "title": "logstash-*",
    "timeFieldName": "@timestamp"
  }
}'

echo -e "\n${GREEN}✓ Index pattern created!${NC}\n"

# Set default index pattern
echo -e "${YELLOW}Setting default index pattern...${NC}"
curl -X POST "http://localhost:5601/api/kibana/settings/defaultIndex" \
  -u elastic:changeme \
  -H 'kbn-xsrf: true' \
  -H 'Content-Type: application/json' \
  -d '{
  "value": "logstash-*"
}'

echo -e "\n${GREEN}✓ Default index pattern set!${NC}\n"

# Display access information
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}ELK Stack Configuration Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Access Information:"
echo "  • Kibana:         http://localhost:5601"
echo "  • Elasticsearch:  http://localhost:9200"
echo "  • Logstash:       localhost:5000 (TCP/UDP)"
echo "  • Beats input:    localhost:5044"
echo ""
echo "Credentials:"
echo "  • Username: elastic"
echo "  • Password: ch"
echo ""
echo "Next Steps:"
echo "  1. Change the default password for production"
echo "  2. Send test logs to port 5000"
echo "  3. View logs in Kibana Discover"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
