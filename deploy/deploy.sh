#!/usr/bin/env bash
# Publicar examen-brevete en servapp por SSH, desde tu equipo local.
# Requiere haber corrido deploy/setup-servapp.sh una vez (ver README).
# Uso: bash deploy/deploy.sh
set -euo pipefail

HOST="giovanni@10.0.10.11"
DEST="~/sites/examenbrevete"

rsync -av --delete \
  --exclude '.git' \
  --exclude '.github' \
  --exclude 'deploy' \
  --exclude 'node_modules' \
  --exclude 'tests' \
  --exclude 'test-results' \
  --exclude 'playwright-report' \
  --exclude 'playwright.config.js' \
  --exclude 'package.json' \
  --exclude 'package-lock.json' \
  -e ssh \
  ./ "$HOST:$DEST/"

echo ""
echo "Listo. Verificar con:"
echo "  ssh $HOST 'curl -I http://127.0.0.1:8090'"
