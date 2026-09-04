# Despliegue a producción (servapp)

El sitio es 100% estático (HTML/CSS/JS, sin backend), así que el despliegue
consiste en sincronizar los archivos a un directorio que Nginx sirve en
`servapp`, por SSH desde tu equipo local. No requiere credenciales de
Mercado Pago ni acceso a otros servidores.

## 1. Configuración única en servapp

Desde tu equipo, clona el repo (o usa el que ya tengas) y corre el script
de configuración contra servapp por SSH:

```bash
git clone https://github.com/GioviVZ/examen-brevete.git
cd examen-brevete
ssh serapp 'bash -s' < deploy/setup-servapp.sh
```

Esto crea `/var/www/examenbrevete` en servapp y un bloque de Nginx
escuchando en el puerto `8090` (dedicado, para no interferir con lo que
ya haya en el puerto 80). Ajusta `PORT` o `DOMAIN` al inicio del script
si lo necesitas antes de correrlo.

## 2. Publicar cambios

Cada vez que quieras subir la última versión (por ejemplo tras un
`git pull` en tu equipo), corre desde la carpeta del repo:

```bash
bash deploy/deploy.sh
```

Esto sincroniza los archivos del sitio a `/var/www/examenbrevete` en
servapp vía `rsync` sobre SSH. No requiere privilegios de root (el
bloque de Nginx ya apunta ahí desde el paso 1).

## 3. Reverse proxy / Cloudflare Tunnel

Falta el único paso que no puede hacerse desde un script: apuntar
`examenbrevetesperu.com` hacia `servapp:8090` (`10.0.10.11:8090`) en tu
proxy o túnel. Sin esto el sitio funciona en servapp pero no es alcanzable
desde el dominio público.

## Verificar

```bash
ssh serapp 'curl -I http://127.0.0.1:8090'
```
