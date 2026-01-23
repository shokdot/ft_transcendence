#!/usr/bin/env bash

set -euo pipefail

# Very simple ILM setup for log retention.
# - Creates an ILM policy that deletes logs after 7 days
# - Applies it to indices matching logs-*
#
# Usage:
#   ELASTICSEARCH_URL=http://localhost:9200 ./setup-ilm.sh

ES_URL="${ELASTICSEARCH_URL:-http://localhost:9200}"

echo "Using Elasticsearch at: ${ES_URL}"

echo "Creating ILM policy logs-retention-policy (delete after 7 days)..."
curl -sS -X PUT "${ES_URL}/_ilm/policy/logs-retention-policy" \
  -H "Content-Type: application/json" \
  -d '{
    "policy": {
      "phases": {
        "hot": {
          "actions": {}
        },
        "delete": {
          "min_age": "7d",
          "actions": {
            "delete": {}
          }
        }
      }
    }
  }'
echo

echo "Creating index template logs-template for indices logs-*..."
curl -sS -X PUT "${ES_URL}/_index_template/logs-template" \
  -H "Content-Type: application/json" \
  -d '{
    "index_patterns": ["logs-*"],
    "template": {
      "settings": {
        "index.lifecycle.name": "logs-retention-policy"
      }
    }
  }'
echo

echo "ILM policy and index template created."
