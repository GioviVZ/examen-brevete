# Despliegue a producción (servapp)

El sitio es 100% estático (HTML/CSS/JS, sin backend), así que el despliegue
consiste en sincronizar los archivos a un directorio que Nginx sirve en
`servapp`. No requiere credenciales de Mercado Pago ni acceso a otros
servidores.

## 1. Configuración única en servapp

Por SSH, como `giovanni`:

```bash
git clone https://github.com/GioviVZ/examen-brevete.git
cd examen-brevete
bash deploy/setup-servapp.sh
```

Esto crea `~/sites/examenbrevete` y un bloque de Nginx escuchando en el
puerto `8090` (dedicado, para no interferir con lo que ya haya en el
puerto 80). Ajusta `PORT` o `DOMAIN` al inicio del script si lo necesitas
antes de correrlo.

## 2. Runner autohospedado de GitHub Actions

Para que cada `git push` a `main` despliegue solo, sin abrir ningún
puerto de entrada hacia servapp:

1. En GitHub: **Settings → Actions → Runners → New self-hosted runner**,
   elige Linux/x64.
2. Copia y pega los comandos que muestra GitHub (incluyen un token de
   registro válido por ~1 hora) por SSH en `servapp`.
3. En vez de `./run.sh`, instálalo como servicio para que sobreviva a
   reinicios:
   ```bash
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

De ahí en adelante, cada push a `main` dispara
`.github/workflows/deploy.yml`, que sincroniza los archivos a
`~/sites/examenbrevete` sin necesitar privilegios de root (el bloque de
Nginx ya apunta ahí desde el paso 1).

## 3. Reverse proxy / Cloudflare Tunnel

Falta el único paso que no puede hacerse desde aquí: apuntar
`examenbrevetesperu.com` hacia `servapp:8090` (`10.0.10.11:8090`) en tu
proxy o túnel. Sin esto el sitio funciona en servapp pero no es alcanzable
desde el dominio público.

## Verificar

```bash
curl -I http://127.0.0.1:8090   # desde servapp, tras el primer despliegue
```
