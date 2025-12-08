#!/bin/bash
set -e

echo "Building release package..."

# Build the project
npm run build

# Create release directory
rm -rf release
mkdir -p "release/astroneer bridge"

# Copy ONLY runtime files (no build tools!)
cp -r dist "release/astroneer bridge/"
cp -r node_modules "release/astroneer bridge/"
cp package.json "release/astroneer bridge/"
cp TakaroConfig.txt "release/astroneer bridge/"
cp start.bat "release/astroneer bridge/"
cp stop.bat "release/astroneer bridge/"
cp rcon-console.js "release/astroneer bridge/"
cp rcon-console.bat "release/astroneer bridge/"
cp QUICK_START.txt "release/astroneer bridge/"
cp README.md "release/astroneer bridge/"
cp References.md "release/astroneer bridge/"
cp RELEASE_NOTES_v1.10.1.md "release/astroneer bridge/"

# Create zip
cd release
zip -r astroneer-bridge.zip "astroneer bridge"

echo "✅ Release package created: release/takaro-astroneer-bridge-windows.zip"
echo "Size: $(du -h takaro-astroneer-bridge-windows.zip | cut -f1)"
