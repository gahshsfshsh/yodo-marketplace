#!/bin/bash

# YoDo Marketplace Deployment Script
# Deploy to: alexei@158.255.6.22

set -e  # Exit on error

echo "🚀 Starting YoDo Marketplace deployment..."

# Configuration
SERVER_USER="alexei"
SERVER_IP="158.255.6.22"
SERVER_PATH="/home/alexei/yodo-marketplace"
PROJECT_NAME="yodo-landing"

echo "📦 Building production version..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install --force
fi

# Build the project
echo "🔨 Building Next.js application..."
npm run build

echo "📤 Deploying to server ${SERVER_USER}@${SERVER_IP}..."

# Create directory on server if it doesn't exist
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${SERVER_PATH}"

# Sync files to server (excluding node_modules, .git, etc.)
echo "📂 Syncing files..."
rsync -avz --exclude 'node_modules' \
           --exclude '.git' \
           --exclude '.next/cache' \
           --exclude 'design-vibe-4' \
           --exclude '*.log' \
           --progress \
           ./ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

# Install dependencies and restart on server
echo "🔧 Installing dependencies on server..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /home/alexei/yodo-marketplace

# Install Node.js dependencies
npm install --production

# Kill existing process if running
pkill -f "next start" || true
pkill -f "node.*next" || true

# Start the application with PM2 (if installed) or nohup
if command -v pm2 &> /dev/null; then
    echo "Using PM2 to manage the application..."
    pm2 delete yodo-landing || true
    pm2 start npm --name "yodo-landing" -- start -- -p 3000
    pm2 save
else
    echo "Starting with nohup..."
    nohup npm start &> app.log &
fi

echo "✅ Application started on port 3000"
ENDSSH

echo ""
echo "✨ Deployment completed successfully!"
echo "🌐 Your application is now running at: http://158.255.6.22:3000"
echo ""
echo "📊 To check logs:"
echo "   ssh ${SERVER_USER}@${SERVER_IP} 'cd ${SERVER_PATH} && tail -f app.log'"
echo ""
echo "🔄 To restart the application:"
echo "   ssh ${SERVER_USER}@${SERVER_IP} 'cd ${SERVER_PATH} && pm2 restart yodo-landing'"

