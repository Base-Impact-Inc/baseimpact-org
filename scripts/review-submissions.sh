#!/usr/bin/env bash
# Review contact submissions stored by /api/contact.
# Usage:
#   bash scripts/review-submissions.sh all      # last 100 submissions
#   bash scripts/review-submissions.sh failed   # flagged / un-notified submissions
#   bash scripts/review-submissions.sh counts   # status summary
set -euo pipefail

DB="${DB:-baseimpact-verify}"
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-17e3d98243fa07749e75a8073a6b46ba}"
MODE="${1:-all}"

COLS="id, created_at, name, email, message, source_page, notification_status, notification_attempts, notification_error, notified_at"

case "$MODE" in
  all)
    SQL="SELECT $COLS FROM contact_messages ORDER BY id DESC LIMIT 100;"
    ;;
  failed)
    SQL="SELECT $COLS FROM contact_messages WHERE notification_status <> 'sent' ORDER BY id DESC LIMIT 100;"
    ;;
  counts)
    SQL="SELECT notification_status, COUNT(*) AS n FROM contact_messages GROUP BY notification_status ORDER BY n DESC;"
    ;;
  *)
    echo "Usage: $0 [all|failed|counts]" >&2
    exit 1
    ;;
esac

npx wrangler d1 execute "$DB" --remote --command "$SQL" --json
