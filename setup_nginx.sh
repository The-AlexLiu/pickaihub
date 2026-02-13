#!/bin/bash

HOST="104.168.88.212"
USER="root"
PASS="Sv12nUN0b89XukW5Xm"
CONF_FILE="pickaihub.conf"
REMOTE_CONF_DIR="/etc/nginx/sites-available"
REMOTE_ENABLED_DIR="/etc/nginx/sites-enabled"

echo "=== 1. Checking local environment ==="
if ! command -v expect &> /dev/null; then
    echo "Error: 'expect' is required but not installed."
    exit 1
fi

chmod +x ssh_login.exp scp_upload.exp

echo "=== 2. Installing Nginx on server ==="
INSTALL_CMD="if ! command -v nginx &> /dev/null; then \
    apt-get update && apt-get install -y nginx; \
fi && \
systemctl enable nginx && \
systemctl start nginx"

./ssh_login.exp $HOST $USER $PASS "$INSTALL_CMD"

echo "=== 3. Uploading Nginx configuration ==="
./scp_upload.exp $HOST $USER $PASS $CONF_FILE $REMOTE_CONF_DIR/

echo "=== 4. Activating configuration and restarting Nginx ==="
# Link config, remove default, test config, restart
ACTIVATE_CMD="ln -sf $REMOTE_CONF_DIR/$CONF_FILE $REMOTE_ENABLED_DIR/$CONF_FILE && \
rm -f $REMOTE_ENABLED_DIR/default && \
nginx -t && \
systemctl restart nginx"

./ssh_login.exp $HOST $USER $PASS "$ACTIVATE_CMD"

echo "=== Nginx Setup Complete! ==="
echo "You can now access your site at http://pickaihub.com"
