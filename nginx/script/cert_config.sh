#!/bin/bash
set -e

CERT_PATH=/etc/nginx/ssl
mkdir -p $CERT_PATH

openssl req -new -x509 -nodes -days 365 \
    -out $CERT_PATH/cert.pem \
    -keyout $CERT_PATH/key.pem \
    -subj "/CN=mylocal.test"

# Start nginx
exec "$@"
