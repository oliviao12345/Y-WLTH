#!/usr/bin/env bash
# Regenerates the iOS Simulator screenshots (macOS + Xcode). Expo must be running: npx expo start --port 8090
# Usage: ./scripts/screenshots-ios.sh [LAN-IP]
set -euo pipefail
cd "$(dirname "$0")/.."
IP="${1:-$(ipconfig getifaddr en0)}"
for pair in "home:ios-1-wealth" "insights:ios-2-intelligence" "money:ios-3-money" "profile:ios-4-profile"; do
  xcrun simctl terminate booted host.exp.Exponent >/dev/null 2>&1 || true
  sleep 1
  xcrun simctl openurl booted "exp://$IP:8090/--/${pair%%:*}"
  sleep 30
  xcrun simctl io booted screenshot "docs/screenshots/${pair##*:}.png" >/dev/null
done
echo "iOS screenshots written to docs/screenshots/"
