#!/bin/bash
# Move audio files from Desktop to project directory
# Usage: ./move-audio.sh <destination-directory>

if [ -z "$1" ]; then
  echo "Usage: $0 <destination-directory>"
  echo "Example: $0 assets/audio/"
  exit 1
fi

DEST_DIR="$1"
DESKTOP_DIR="$HOME/Desktop"

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Find and move audio files
find "$DESKTOP_DIR" -maxdepth 1 -name "*.mp3" -type f | while read file; do
  filename=$(basename "$file")
  echo "Moving $filename to $DEST_DIR"
  mv "$file" "$DEST_DIR"
done

echo "Audio files moved to $DEST_DIR"
