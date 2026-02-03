#!/bin/bash
set -e
echo "Starting Build Process (Monorepo)..."

# 1. Frontend Build
echo "-----------------------------------"
echo "Building Frontend..."
npm ci --legacy-peer-deps
npm run build

# 2. Backend Build
echo "-----------------------------------"
echo "Building Backend..."
cd server
npm ci --legacy-peer-deps
npm run build
cd ..

echo "-----------------------------------"
echo "Build Successful!"
echo "To start the server, run: cd server && npm run start:prod"
