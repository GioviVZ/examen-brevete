#!/usr/bin/env bash
# Configuración única de servapp para servir examenbrevetesperu.com.
# Correr UNA sola vez por SSH en servapp, como el usuario giovanni.
# No contiene secretos.
set -euo pipefail

SITE_DIR="$HOME/sites/examenbrevete"
NGINX_CONF="/etc/nginx/sites-available/examenbrevete.conf"
PORT=8090
DOMAIN="examenbrevetesperu.com"

echo "==> Creando directorio del sitio en $SITE_DIR"
mkdir -p "$SITE_DIR"

echo "==> Escribiendo bloque de Nginx en $NGINX_CONF (puerto $PORT)"
sudo tee "$NGINX_CONF" > /dev/null <<EOF
server {
    listen $PORT;
    server_name $DOMAIN www.$DOMAIN;
    root $SITE_DIR;
    index index.html;
    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF

# Si tu instalación de Nginx no usa sites-available/sites-enabled (por
# ejemplo en distros basadas en RHEL), comenta la línea de arriba y
# guarda el bloque directamente en /etc/nginx/conf.d/examenbrevete.conf
if [ -d /etc/nginx/sites-enabled ]; then
  sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/examenbrevete.conf
fi

echo "==> Probando configuración de Nginx"
sudo nginx -t

echo "==> Recargando Nginx"
sudo systemctl reload nginx

echo ""
echo "Listo. El sitio quedará servido en http://127.0.0.1:$PORT una vez que"
echo "corras deploy/deploy.sh desde tu equipo local (ver README)."
echo ""
echo "Falta: apuntar tu reverse proxy / Cloudflare Tunnel para que"
echo "$DOMAIN -> servapp:$PORT (10.0.10.11:$PORT)."
