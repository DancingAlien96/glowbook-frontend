#!/bin/bash
# Ecodama — first-time server setup
# Run as root on a fresh Ubuntu/Debian server:
#   bash <(curl -fsSL https://raw.githubusercontent.com/DancingAlien96/glowbook-frontend/main/deploy/server-setup.sh)

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}✦ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }

log "Actualizando paquetes..."
apt-get update -qq && apt-get upgrade -y -qq

log "Instalando paquetes base..."
apt-get install -y -qq curl git unzip ufw nginx certbot python3-certbot-nginx

# ── Docker ────────────────────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  log "Instalando Docker..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
  log "Docker instalado."
else
  log "Docker ya está instalado."
fi

# ── Node.js 22 ────────────────────────────────────────────────────────────────
if ! node -v 2>/dev/null | grep -q "v22"; then
  log "Instalando Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - > /dev/null
  apt-get install -y -qq nodejs
  log "Node.js $(node -v) instalado."
else
  log "Node.js $(node -v) ya está instalado."
fi

# ── PM2 ───────────────────────────────────────────────────────────────────────
if ! command -v pm2 &>/dev/null; then
  log "Instalando PM2..."
  npm install -g pm2 --silent
fi
pm2 startup systemd -u root --hp /root 2>/dev/null | tail -1 | bash || true

# ── Firewall ──────────────────────────────────────────────────────────────────
log "Configurando firewall (UFW)..."
ufw allow 22/tcp  > /dev/null
ufw allow 80/tcp  > /dev/null
ufw allow 443/tcp > /dev/null
ufw --force enable > /dev/null

# ── Directorios ───────────────────────────────────────────────────────────────
log "Creando directorios..."
mkdir -p /opt/ecodama/{frontend,backend}

# ── Nginx ─────────────────────────────────────────────────────────────────────
log "Configurando Nginx..."
cat > /etc/nginx/sites-available/ecodama.conf << 'NGINX'
server {
    listen 80;
    server_name ecodama.online www.ecodama.online;

    client_max_body_size 20M;

    location /api/uploadthing {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass         http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    location /uploads/ {
        proxy_pass       http://127.0.0.1:4000;
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        'upgrade';
        proxy_set_header   Host              $host;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/ecodama.conf /etc/nginx/sites-enabled/ecodama.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ── SSL ───────────────────────────────────────────────────────────────────────
if [ ! -f /etc/letsencrypt/live/ecodama.online/fullchain.pem ]; then
  log "Obteniendo certificado SSL (certbot)..."
  certbot --nginx -d ecodama.online -d www.ecodama.online \
    --non-interactive --agree-tos -m soporte@ecodama.online --redirect
  log "SSL configurado."
else
  log "SSL ya está configurado."
fi

log "================================================================"
log "Setup completo. Ahora corre: bash /opt/ecodama/deploy.sh"
log "================================================================"
