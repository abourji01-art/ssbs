#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Waiting for Elasticsearch to be ready...${NC}"
until curl -s -u elastic:changeme http://localhost:9200/_cluster/health | grep -q '"status":"green"\|"status":"yellow"'; do
  echo "Waiting..."
  sleep 5
done

echo -e "${GREEN}✓ Elasticsearch is ready!${NC}\n"

# Create ILM policy with retention and archiving
echo -e "${YELLOW}Creating ILM policy for log retention...${NC}"
curl -X PUT "http://localhost:9200/_ilm/policy/logstash-policy" \
  -u elastic:changeme \
  -H 'Content-Type: application/json' \
  -d '{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_size": "50gb",
            "max_age": "1d"
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": {
            "number_of_shards": 1
          },
          "forcemerge": {
            "max_num_segments": 1
          },
          "set_priority": {
            "priority": 50
          }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "freeze": {},
          "set_priority": {
            "priority": 0
          }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}'

echo -e "\n${GREEN}✓ ILM policy created!${NC}\n"

# Create index template
echo -e "${YELLOW}Creating index template...${NC}"
curl -X PUT "http://localhost:9200/_index_template/logstash-template" \
  -u elastic:changeme \
  -H 'Content-Type: application/json' \
  -d '{
  "index_patterns": ["logstash-*"],
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "index.lifecycle.name": "logstash-policy",
      "index.lifecycle.rollover_alias": "logstash"
    },
    "mappings": {
      "properties": {
        "@timestamp": {
          "type": "date"
        },
        "message": {
          "type": "text"
        },
        "level": {
          "type": "keyword"
        },
        "environment": {
          "type": "keyword"
        },
        "log_source": {
          "type": "keyword"
        }
      }
    }
  }
}'

echo -e "\n${GREEN}✓ Index template created!${NC}\n"

# Create initial index
echo -e "${YELLOW}Creating initial logstash index...${NC}"
curl -X PUT "http://localhost:9200/logstash-000001" \
  -u elastic:changeme \
  -H 'Content-Type: application/json' \
  -d '{
  "aliases": {
    "logstash": {
      "is_write_index": true
    }
  }
}'

echo -e "\n${GREEN}✓ Initial index created!${NC}\n"

# Display policy information
echo -e "${YELLOW}Log Retention Policy Summary:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Hot Phase:   0-7 days    (Active indexing)"
echo "  Warm Phase:  7-30 days   (Compressed, read-only)"
echo "  Cold Phase:  30-90 days  (Frozen, rarely accessed)"
echo "  Delete:      After 90 days"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "\n${GREEN}✓ Log retention and archiving policies configured successfully!${NC}"
