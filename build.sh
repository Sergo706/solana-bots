#!/bin/bash
set -e

CURRENT_VERSION="0.0.0"

if [ -d "build" ]; then
    RAW_VERSION=$(find build -type f 2>/dev/null | grep -oE 'V[0-9]+\.[0-9]+\.[0-9]+' | sed 's/V//' | sort -V | tail -n 1)
    if [ -n "$RAW_VERSION" ]; then
        CURRENT_VERSION="$RAW_VERSION"
    fi
fi

if [ "$CURRENT_VERSION" = "0.0.0" ]; then
    NEW_VERSION="1.0.0"
else
    IFS='.' read -r major minor patch <<< "$CURRENT_VERSION"
    
    if [ "$BUMP" = "major" ]; then
        major=$((major + 1))
        minor=0
        patch=0
    elif [ "$BUMP" = "minor" ]; then
        minor=$((minor + 1))
        patch=0
    else
        patch=$((patch + 1))
    fi
    NEW_VERSION="${major}.${minor}.${patch}"
fi

VERSION_STR="V${NEW_VERSION}"
echo "Current Detected Version: V${CURRENT_VERSION}"
echo "Next Target Version: ${VERSION_STR} (Bump Type: ${BUMP:-patch})"

echo "Wiping old build directory for a clean slate..."
rm -rf build
mkdir -p build/cli build/ui


echo "Building CLI..."
export CLI_BUILD=1
npm run build

docker run --rm -v "$PWD":/work -w /work amake/innosetup /DAppVersion="${NEW_VERSION}" /O"build/cli/windows-installer-${VERSION_STR}" installer.iss

export CLI_BUILD=0

echo "Building UI..."
cd ui
rm -rf out .vite
npm run make

DEBUG=electron-windows-installer* npx electron-forge make --platform=win32 --arch=x64 --targets=@electron-forge/maker-squirrel
cd ..
echo "Organizing platform installers to build/ui/..."

if [ -d "ui/out/make" ]; then
    if [ -d "ui/out/make/squirrel.windows/x64" ]; then
        TARGET_DIR="build/ui/win32-x64-${VERSION_STR}"
        mkdir -p "$TARGET_DIR"
        mv ui/out/make/squirrel.windows/x64/* "$TARGET_DIR/"
        echo "Moved Windows installer to $TARGET_DIR"
    fi

    if [ -d "ui/out/make/deb/x64" ]; then
        TARGET_DIR="build/ui/deb-x64-${VERSION_STR}"
        mkdir -p "$TARGET_DIR"
        mv ui/out/make/deb/x64/* "$TARGET_DIR/"
        echo "Moved deb installer to $TARGET_DIR"
    fi
    
    if [ -d "ui/out/make/rpm/x64" ]; then
        TARGET_DIR="build/ui/rpm-x64-${VERSION_STR}"
        mkdir -p "$TARGET_DIR"
        mv ui/out/make/rpm/x64/* "$TARGET_DIR/"
        echo "Moved rpm installer to $TARGET_DIR"
    fi
else
    echo "Warning: ui/out/make directory not found!"
fi

rm -rf ui/out ui/.vite ui/dist-worker dist
echo "Compilation and version tracking successful for ${VERSION_STR}!"


# if [ -f .env.build ]; then
#     echo " Loading build config from .env."
#     set -a 
#     source .env.build
#     set +a
# fi