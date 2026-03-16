# ELK Stack - Log Management Infrastructure

Complete ELK (Elasticsearch, Logstash, Kibana) stack for centralized log management.

## 📋 Features

✅ **Elasticsearch** - Store and index logs  
✅ **Logstash** - Collect and transform logs  
✅ **Kibana** - Visualization and dashboards  
✅ **Log Retention Policies** - Automatic archiving (90 days)  
✅ **Secure Access** - Authentication enabled  
✅ **ILM Policies** - Hot/Warm/Cold/Delete phases  

## 🚀 Quick Start

### 1. Start the Stack

```bash
chmod +x setup.sh setup-ilm-policy.sh setup-kibana.sh
./setup.sh
```

Or manually:

```bash
# Start containers
docker-compose up -d

# Wait 30 seconds, then configure
./setup-ilm-policy.sh
./setup-kibana.sh
```

### 2. Access Services

- **Kibana**: http://localhost:5601
- **Elasticsearch**: http://localhost:9200
- **Credentials**: `elastic` / `changeme`

### 3. Send Test Logs

```bash
# JSON log via TCP
echo '{"message": "Test log", "level": "info"}' | nc localhost 5000

# Multiple logs
for i in {1..10}; do
  echo '{"message": "Log '$i'", "level": "info", "service": "app"}' | nc localhost 5000
  sleep 1
done
```

## 📊 Log Retention Policy

| Phase | Duration | Action |
|-------|----------|--------|
| **Hot** | 0-7 days | Active indexing, searches |
| **Warm** | 7-30 days | Compressed, read-only |
| **Cold** | 30-90 days | Frozen, rarely accessed |
| **Delete** | After 90 days | Permanently deleted |

## 🔐 Security

### Default Credentials
- Username: `elastic`
- Password: `changeme`

### Change Password (Production)

```bash
# Connect to Elasticsearch container
docker exec -it elasticsearch bash

# Change password
bin/elasticsearch-users passwd elastic
```

Then update in:
- `docker-compose.yml` (all 3 services)
- `logstash/config/logstash.yml`
- `logstash/pipeline/logstash.conf`

## 📁 Project Structure

```
devops/
├── docker-compose.yml              # Main orchestration
├── setup.sh                        # Complete setup script
├── setup-ilm-policy.sh            # Log retention config
├── setup-kibana.sh                # Kibana setup
├── elasticsearch/
│   └── config/
│       └── elasticsearch.yml      # ES configuration
└── logstash/
    ├── config/
    │   └── logstash.yml          # Logstash configuration
    └── pipeline/
        └── logstash.conf         # Log processing pipeline
```

## 🔧 Configuration

### Elasticsearch
- **Memory**: 512MB heap (adjust in docker-compose.yml)
- **Ports**: 9200 (HTTP), 9300 (Transport)

### Logstash
- **Input Ports**: 
  - 5044 (Beats)
  - 5000 (TCP/UDP)
- **Output**: Elasticsearch with ILM

### Kibana
- **Port**: 5601
- **Default Index**: logstash-*

## 📝 Common Commands

```bash
# View logs
docker-compose logs -f

# Check Elasticsearch indices
curl -u elastic:changeme http://localhost:9200/_cat/indices?v

# Check ILM policy
curl -u elastic:changeme http://localhost:9200/_ilm/policy/logstash-policy

# Restart services
docker-compose restart

# Stop stack
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 🐛 Troubleshooting

### Elasticsearch won't start
- Check memory: Increase `ES_JAVA_OPTS` in docker-compose.yml
- Check disk space: `df -h`
- View logs: `docker logs elasticsearch`

### Logstash can't connect
- Verify password matches in all config files
- Wait for Elasticsearch to be healthy
- Check: `curl -u elastic:changeme http://localhost:9200`

### No logs in Kibana
- Check Logstash: `docker logs logstash`
- Send test log: `echo '{"test": "log"}' | nc localhost 5000`
- Verify index exists: `curl -u elastic:changeme http://localhost:9200/_cat/indices`

## 📚 Additional Resources

- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/index.html)
- [Logstash Documentation](https://www.elastic.co/guide/en/logstash/7.17/index.html)
- [Kibana Documentation](https://www.elastic.co/guide/en/kibana/7.17/index.html)

## ⚠️ Production Notes

Before deploying to production:

1. **Change default password**
2. **Enable SSL** (`xpack.security.http.ssl.enabled=true`)
3. **Increase memory** (2GB+ for Elasticsearch)
4. **Add replicas** for high availability
5. **Configure backups**
6. **Set up monitoring alerts**
7. **Use environment variables** for secrets
