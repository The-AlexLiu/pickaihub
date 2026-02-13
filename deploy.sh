#!/bin/bash

HOST="104.168.88.212"
USER="root"
PASS="Sv12nUN0b89XukW5Xm"
REMOTE_DIR="/var/www/pickaihub"
ARCHIVE_NAME="pickaihub_deploy.tar.gz"

echo "=== 1. Checking local environment ==="
if ! command -v expect &> /dev/null; then
    echo "Error: 'expect' is required but not installed."
    exit 1
fi

chmod +x ssh_login.exp scp_upload.exp

echo "=== 2. Preparing deployment package ==="
# Remove old archive if exists
rm -f $ARCHIVE_NAME

# Create tarball excluding heavy/unnecessary folders
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='.DS_Store' \
    --exclude='*.tar.gz' \
    -czf $ARCHIVE_NAME .

echo "Package created: $ARCHIVE_NAME"

echo "=== 3. Setting up remote server ==="
# Check and install Node.js/PM2 if missing
# Note: We use a heredoc passed to expect script to run complex commands
SETUP_CMD="mkdir -p $REMOTE_DIR && \
if ! command -v node &> /dev/null; then \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs; \
fi && \
if ! command -v pm2 &> /dev/null; then \
    npm install -g pm2; \
fi"

./ssh_login.exp $HOST $USER $PASS "$SETUP_CMD"

echo "=== 4. Uploading package ==="
./scp_upload.exp $HOST $USER $PASS $ARCHIVE_NAME $REMOTE_DIR/

echo "=== 5. Deploying on server ==="
# Extract, Install, Build, Start
DEPLOY_CMD="cd $REMOTE_DIR && \
tar -xzf $ARCHIVE_NAME && \
rm $ARCHIVE_NAME && \
npm install && \
npm run build && \
pm2 delete pickaihub || true && \
pm2 start npm --name 'pickaihub' -- start -- -p 3000 && \
pm2 save"

./ssh_login.exp $HOST $USER $PASS "$DEPLOY_CMD"

echo "=== Deployment Complete! ==="
echo "You can access your site at http://$HOST:3000"

# Cleanup local archive
rm $ARCHIVE_NAME
