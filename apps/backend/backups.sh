#!/usr/bin/env bash

# --- CONFIGURATION ---
DB_NAME="ca-sql"
DB_USER="postgres"
BACKUP_DIR="/mnt/pgbackups/backups"
DATE_FORMAT_DAILY=$(date +%Y-%m-%d)
DATE_FORMAT_WEEKLY=$(date +%Y-%m-%W)
DATE_FORMAT_MONTHLY=$(date +%Y-%m)

# --- SCRIPT LOGIC ---

# 1. Ensure the backup directory exists
mkdir -p $BACKUP_DIR

# 2. Daily Backup (Standard Naming)
DAILY_FILE="$BACKUP_DIR/daily_${DB_NAME}_${DATE_FORMAT_DAILY}.sql.gz"
echo "Creating daily backup: $DAILY_FILE"
# Use pg_dump with the -Fc (Custom format) for efficiency, and pipe to gzip
# NOTE: pg_dump will prompt for a password if PGUSER is not set or you don't use a .pgpass file
pg_dump -Fc -h localhost -U $DB_USER $DB_NAME | gzip > "$DAILY_FILE"

# 3. Handle Weekly and Monthly Naming (Only for the cron entries that run the script)

# If today is the 1st of the month, create a hardlink for the monthly backup
if [ "$(date +%d)" = "01" ]; then
    MONTHLY_FILE="$BACKUP_DIR/monthly_${DB_NAME}_${DATE_FORMAT_MONTHLY}.sql.gz"
    echo "Creating monthly link: $MONTHLY_FILE"
    # Create a link from the daily file to the monthly file (saves disk space)
    ln -f "$DAILY_FILE" "$MONTHLY_FILE"
fi

# If today is a Monday, create a hardlink for the weekly backup
if [ "$(date +%u)" = "1" ]; then
    WEEKLY_FILE="$BACKUP_DIR/weekly_${DB_NAME}_${DATE_FORMAT_WEEKLY}.sql.gz"
    echo "Creating weekly link: $WEEKLY_FILE"
    ln -f "$DAILY_FILE" "$WEEKLY_FILE"
fi

# 4. Rotation/Clean-up Logic

# Daily (Keep 7): Delete daily files older than 7 days
find $BACKUP_DIR -name "daily_${DB_NAME}_*.sql.gz" -mtime +7 -delete
echo "Cleaned up daily files older than 7 days."

# Weekly (Keep 3): Delete weekly files older than 21 days (approx. 3 weeks)
find $BACKUP_DIR -name "weekly_${DB_NAME}_*.sql.gz" -mtime +21 -delete
echo "Cleaned up weekly files older than 3 weeks."

# Monthly (Keep 12): Delete monthly files older than 365 days (approx. 1 year)
find $BACKUP_DIR -name "monthly_${DB_NAME}_*.sql.gz" -mtime +365 -delete
echo "Cleaned up monthly files older than 1 year."