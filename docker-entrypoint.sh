#!/bin/sh

set -eu

APP_DIR="/usr/share/nginx/html"
ENV_FILE="$APP_DIR/.env"
RUNTIME_CONFIG_FILE="$APP_DIR/js/runtime-config.js"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

BACKEND_URL_VALUE="${backend_url:-${BACKEND_URL:-}}"
ESCAPED_BACKEND_URL=$(printf "%s" "$BACKEND_URL_VALUE" | sed "s/['\\\\]/\\\\&/g")

cat > "$RUNTIME_CONFIG_FILE" <<EOF
window.lfcRuntimeConfig = {
  backendUrl: '$ESCAPED_BACKEND_URL'
};
EOF

exec nginx -g "daemon off;"
