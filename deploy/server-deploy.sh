#!/bin/bash
# Ecodama — deploy backend + frontend
# Corre en el servidor después de server-setup.sh
# Uso: bash /opt/ecodama/deploy.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}✦ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
err()  { echo -e "${RED}✗ $1${NC}"; exit 1; }

FRONTEND_DIR=/opt/ecodama/frontend
BACKEND_DIR=/opt/ecodama/backend

# ── Validar que los archivos de entorno existan ───────────────────────────────
[ -f "$BACKEND_DIR/docker-compose.prod.yml" ] \
  || err "Falta $BACKEND_DIR/docker-compose.prod.yml — copia el código primero."
[ -f "$FRONTEND_DIR/.env.local" ] \
  || err "Falta $FRONTEND_DIR/.env.local — créalo primero (ver instrucciones)."

# ── Backend (Docker Compose) ───────────────────────────────────────────────────
log "Levantando backend (Docker Compose)..."
docker compose -f "$BACKEND_DIR/docker-compose.prod.yml" up -d --build --remove-orphans

log "Esperando que MySQL esté listo..."
for i in $(seq 1 20); do
  docker exec glowbook-mysql mysqladmin ping -h localhost -uroot \
    -p"$(grep MYSQL_ROOT_PASSWORD $BACKEND_DIR/docker-compose.prod.yml | head -1 | cut -d'"' -f2)" \
    --silent 2>/dev/null && break || sleep 5
done

log "Esperando que API esté lista..."
API_URL=$(grep NEXT_PUBLIC_API_URL "$FRONTEND_DIR/.env.local" | cut -d'=' -f2 | tr -d ' ')
API_URL=${API_URL:-"http://localhost:4000/api"}
for i in $(seq 1 30); do
  if curl -sf "${API_URL}/health" > /dev/null 2>&1 || curl -sf "${API_URL}/salons" > /dev/null 2>&1; then
    log "API está lista"
    break
  fi
  warn "Esperando API... intento $i/30"
  sleep 2
done

# ── Frontend (Next.js standalone) ─────────────────────────────────────────────
log "Instalando dependencias del frontend..."
cd "$FRONTEND_DIR"
npm ci --prefer-offline --loglevel warn

log "Compilando Next.js (esto tarda ~1-2 min)..."
npm run build

log "Copiando assets estáticos al servidor standalone..."
cp -r .next/static  .next/standalone/.next/static
cp -r public         .next/standalone/public

# ── PM2 ───────────────────────────────────────────────────────────────────────
log "Configurando PM2..."
cat > /opt/ecodama/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: "ecodama-frontend",
    script: "/opt/ecodama/frontend/.next/standalone/server.js",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      HOSTNAME: "127.0.0.1",
    },
    error_file: "/var/log/pm2/ecodama-frontend-error.log",
    out_file:   "/var/log/pm2/ecodama-frontend-out.log",
    max_memory_restart: "512M",
  }],
};
EOF

mkdir -p /var/log/pm2

if pm2 describe ecodama-frontend > /dev/null 2>&1; then
  pm2 reload ecodama-frontend
else
  pm2 start /opt/ecodama/ecosystem.config.js
fi
pm2 save

log "============================================"
log "Deploy completo."
log "  Frontend: https://ecodama.online"
log "  API:      https://ecodama.online/api"
log "  Logs:     pm2 logs ecodama-frontend"
log "============================================"
