#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "🚀 PROPERTY OS — ONE-CLICK HOSTINGER VPS DEPLOYMENT"
echo "=========================================================="

APP_DIR="/var/www/realestate"
cd "$APP_DIR"

echo "📥 1/6 Fetching latest master branch..."
git fetch origin master
git reset --hard origin/master

echo "📦 2/6 Installing workspace dependencies..."
npm install --legacy-peer-deps

echo "🏗️ 3/6 Building Monorepo Workspaces..."
# Build shared library first
npm run build --workspace=@repo/shared || true

# Build backend API
echo "  -> Compiling Backend API..."
npm run build --workspace=@repo/api

# Build Public Web Frontend
echo "  -> Compiling Public Web Frontend..."
npm run build --workspace=@repo/web

# Build Admin CRM Frontend
echo "  -> Compiling Admin CRM Portal..."
npm run build --workspace=@repo/admin

echo "🔄 4/6 Reloading PM2 Cluster (Zero-Downtime)..."
mkdir -p logs
pm2 reload ecosystem.config.js --env production --update-env || pm2 start ecosystem.config.js --env production

echo "🌐 5/6 Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "🩺 6/6 Running Health Verification Check..."
sleep 3
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/api/v1/health || true)

if [ "$HEALTH_STATUS" -eq 200 ]; then
  echo "✅ Health check PASSED (HTTP 200). Deployment completed successfully!"
else
  echo "⚠️ Health check returned HTTP $HEALTH_STATUS. Please inspect pm2 logs:"
  pm2 logs --lines 20
fi

echo "=========================================================="
echo "🎉 DEPLOYMENT FINISHED AT $(date)"
echo "=========================================================="
