#!/bin/bash
set -e

echo "Building release package..."

# Build the project
npm run build

# Create release directory
rm -rf release
mkdir -p release/takaro-astroneer-bridge

# Copy essential files
cp -r dist release/takaro-astroneer-bridge/
cp -r node_modules release/takaro-astroneer-bridge/
cp package.json release/takaro-astroneer-bridge/
cp TakaroConfig.txt release/takaro-astroneer-bridge/
cp start.bat release/takaro-astroneer-bridge/
cp stop.bat release/takaro-astroneer-bridge/
cp QUICK_START.txt release/takaro-astroneer-bridge/
cp README.md release/takaro-astroneer-bridge/

# Create zip
cd release
zip -r takaro-astroneer-bridge-windows.zip takaro-astroneer-bridge

echo "✅ Release package created: release/takaro-astroneer-bridge-windows.zip"
echo "Size: $(du -h takaro-astroneer-bridge-windows.zip | cut -f1)"
