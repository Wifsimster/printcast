#!/usr/bin/env bash
# printcast <- ntfy bridge
#
# Subscribes to an ntfy topic and prints every incoming message via
# POST /print/text. Run it as a long-lived process (systemd unit, container,
# screen/tmux session, ...).
#
# Requires: ntfy CLI, curl, jq.
#
# Configure with environment variables:
#   NTFY_TOPIC        ntfy topic to subscribe to            (required)
#   PRINTCAST_TOKEN   bearer token for printcast            (required)
#   NTFY_URL          ntfy server base URL   (default: https://ntfy.sh)
#   PRINTCAST_URL     printcast base URL
#                     (default: https://printcast.battistella.ovh)
set -euo pipefail

NTFY_URL="${NTFY_URL:-https://ntfy.sh}"
NTFY_TOPIC="${NTFY_TOPIC:?set NTFY_TOPIC to the ntfy topic to subscribe to}"
PRINTCAST_URL="${PRINTCAST_URL:-https://printcast.battistella.ovh}"
PRINTCAST_TOKEN="${PRINTCAST_TOKEN:?set PRINTCAST_TOKEN to your printcast bearer token}"

echo "printcast: subscribing to ${NTFY_URL}/${NTFY_TOPIC}" >&2

# `ntfy subscribe` streams one JSON object per line. Keep only real messages,
# build a request body with jq (safe quoting), and POST it to printcast.
ntfy subscribe --since=now "${NTFY_URL}/${NTFY_TOPIC}" | while read -r event; do
  [ -z "${event}" ] && continue

  body="$(jq -rc 'select(.event == "message")
                  | { text: ([.title, .message] | map(select(. != null and . != "")) | join("\n")),
                      cut: true }' <<<"${event}")"
  [ -z "${body}" ] && continue

  if curl -fsS -X POST "${PRINTCAST_URL}/print/text" \
       -H "Authorization: Bearer ${PRINTCAST_TOKEN}" \
       -H "Content-Type: application/json" \
       -d "${body}" >/dev/null; then
    echo "printcast: printed ntfy message" >&2
  else
    echo "printcast: failed to print ntfy message" >&2
  fi
done
