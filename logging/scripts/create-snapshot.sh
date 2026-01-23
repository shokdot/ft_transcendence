#!/usr/bin/env bash

set -euo pipefail

# Very simple manual snapshot script for archiving logs.
# - Assumes a filesystem snapshot repository named logs-backup
# - Stores snapshots under /usr/share/elasticsearch/snapshots (mounted from logging/elasticsearch/snapshots)
#
# Usage:
#   ELASTICSEARCH_URL=http://localhost:9200 ./create-snapshot.sh my-snapshot-name
#
# To register the repository once:
#   curl -X PUT \"$ELASTICSEARCH_URL/_snapshot/logs-backup\" \\
#     -H 'Content-Type: application/json' \\
#     -d '{\"type\":\"fs\",\"settings\":{\"location\":\"/usr/share/elasticsearch/snapshots\"}}'

ES_URL=\"${ELASTICSEARCH_URL:-http://localhost:9200}\"
SNAPSHOT_NAME=\"${1:-}\"

if [[ -z \"$SNAPSHOT_NAME\" ]]; then
  echo \"Usage: $0 <snapshot-name>\"
  exit 1
fi

echo \"Creating snapshot '$SNAPSHOT_NAME' in repository 'logs-backup'...\"

curl -sS -X PUT \"${ES_URL}/_snapshot/logs-backup/${SNAPSHOT_NAME}?wait_for_completion=true\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"indices\": \"logs-*\",
    \"include_global_state\": false
  }'
echo

echo \"Snapshot created.\"

