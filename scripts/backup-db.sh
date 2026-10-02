#!/usr/bin/env bash
set -e

# Configuration
BACKUP_DIR="/var/backups/realestate"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/realestate_backup_${TIMESTAMP}.tar.gz"
RETENTION_DAYS=14

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "=========================================================="
echo "💾 PROPERTY OS — AUTOMATED DATABASE BACKUP"
echo "TIMESTAMP: $(date)"
echo "=========================================================="

# Load environment variables
if [ -f "/var/www/realestate/.env" ]; then
    export $(grep -v '^#' /var/www/realestate/.env | xargs)
fi

TMP_DUMP="/tmp/mongodump_${TIMESTAMP}"

# Execute MongoDB Dump
echo "1/3 Creating MongoDB binary dump..."
if [ -n "$MONGODB_URI" ]; then
    mongodump --uri="$MONGODB_URI" --out="$TMP_DUMP" --quiet
else
    mongodump --db=realestate --out="$TMP_DUMP" --quiet
fi

# Compress dump archive
echo "2/3 Compressing dump archive into tar.gz..."
tar -czf "$BACKUP_FILE" -C "$TMP_DUMP" .
rm -rf "$TMP_DUMP"

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "✅ Archive created: $BACKUP_FILE ($BACKUP_SIZE)"

# Rotate old backups
echo "3/3 Removing backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -type f -name "realestate_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "🎉 Backup job finished successfully!"
