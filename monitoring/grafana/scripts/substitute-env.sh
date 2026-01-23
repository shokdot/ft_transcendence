#!/bin/sh
set -e

# Substitute environment variables in contact-points.yml
if [ -f /etc/grafana/provisioning/alerting/contact-points.yml ] && [ -n "${GRAFANA_ALERT_EMAIL}" ]; then
  sed -i "s|\${GRAFANA_ALERT_EMAIL}|${GRAFANA_ALERT_EMAIL}|g" /etc/grafana/provisioning/alerting/contact-points.yml
fi

# Execute the original Grafana entrypoint
exec /run.sh "$@"
