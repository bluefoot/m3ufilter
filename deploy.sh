#!/bin/bash

VERSION=$(grep '"version"' package.json | awk -F: '{ print $2 }' | sed 's/[", ]//g')
NAME=$(grep '"name"' package.json | awk -F: '{ print $2 }' | sed 's/[", ]//g')

if [ -z "$VERSION" ] || [ -z "$NAME" ]; then
    echo "Error: Could not extract version or name from package.json. This is a bug."
    echo "You can manually check the name and version and run: docker build -t NAME:VERSION -t NAME:latest ."
    exit 1
fi

echo "Building Docker image: $NAME:$VERSION"
docker build -t $NAME:$VERSION -t $NAME:latest .