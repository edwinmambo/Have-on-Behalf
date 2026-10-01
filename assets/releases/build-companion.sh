#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "Have On Behalf (H.O.B) Companion App - Automated Build"
echo "=========================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MOBILE_DIR="$PROJECT_ROOT/mobile"
ASSETS_RELEASE_DIR="$PROJECT_ROOT/assets/releases"

mkdir -p "$ASSETS_RELEASE_DIR"

echo "Checking Flutter installation..."
if ! command -v flutter &> /dev/null; then
  echo "Error: flutter CLI is not installed or not in PATH."
  echo "Please install Flutter SDK (3.24+) from https://flutter.dev"
  exit 1
fi

echo "Flutter version:"
flutter --version

echo "1. Resolving dependencies..."
(cd "$MOBILE_DIR" && flutter pub get)

echo "2. Running unit tests..."
(cd "$MOBILE_DIR" && flutter test)

echo "3. Building Release APK..."
(cd "$MOBILE_DIR" && flutter build apk --release)

APK_SOURCE="$MOBILE_DIR/build/app/outputs/flutter-apk/app-release.apk"

if [ -f "$APK_SOURCE" ]; then
  cp "$APK_SOURCE" "$ASSETS_RELEASE_DIR/HaveOnBehalf-Companion-EarlyTester.apk"
  echo "Success! APK generated at: $ASSETS_RELEASE_DIR/HaveOnBehalf-Companion-EarlyTester.apk"
  ls -lh "$ASSETS_RELEASE_DIR/HaveOnBehalf-Companion-EarlyTester.apk"
else
  echo "Warning: APK not found at expected path: $APK_SOURCE"
fi

echo "Done! You can now commit the assets/ folder or upload the APK to GitHub Releases."
