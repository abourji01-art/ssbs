#!/bin/bash

# Wait for Elasticsearch to be ready
until curl -s -k -u elastic:atahtah https://localhost:9200/_cluster/health > /dev/null 2>&1; do
  echo "Waiting for Elasticsearch..."
  sleep 5
done

echo "Setting up Kibana system user..."

# Set password for kibana_system user
curl -k -X POST "https://localhost:9200/_security/user/kibana_system/_password" \
  -u elastic:atahtah \
  -H 'Content-Type: application/json' \
  -d '{
  "password": "atahtah"
}'

echo ""
echo "Kibana system user configured successfully!"
