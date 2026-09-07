# Deploy de desarrollo en un nodo Vultr

Este despliegue es independiente de los stacks existentes. Ejecuta únicamente una
réplica de `web` y una de `backend` con Docker Compose. Nginx publica ambos bajo:

- Web: `https://dev.cabildoabierto.ar`
- Backend: `https://dev.cabildoabierto.ar/api`

Los puertos de las aplicaciones quedan ligados a `127.0.0.1`, por lo que no se
exponen directamente a Internet.

## 1. DNS y TLS

Creá un registro `A` para `dev.cabildoabierto.ar` apuntando a la IP del nodo.

Generá un certificado de origen que cubra `dev.cabildoabierto.ar` y copiá sus
archivos al servidor:

```text
/etc/ssl/certs/cabildo-dev-origin.pem
/etc/ssl/private/cabildo-dev-origin.key
```

El archivo de clave debe tener permisos `600`.

## 2. Preparar el nodo

Copiá el repositorio o, como mínimo, `infra/` al nodo y ejecutá como root:

```bash
sudo bash infra/scripts/setup-dev-node.sh
```

Después de copiar el certificado y la clave, validá y activá Nginx:

```bash
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

El usuario configurado en `DEPLOY_SERVER` debe poder ejecutar Docker y escribir
en `/opt/cabildo-dev` y `/etc/cabildo`. Una opción es agregarlo al grupo Docker y
darle propiedad sobre esos directorios:

```bash
sudo usermod -aG docker deploy
sudo chown -R deploy:deploy /opt/cabildo-dev /etc/cabildo
```

Cerrá y volvé a abrir la sesión SSH para aplicar el grupo nuevo.

## 3. Configurar el deploy local

Desde la raíz del repositorio:

```bash
cp infra/env/deploy.dev.env.example infra/env/deploy.dev.env
cp infra/env/web.dev.env.example infra/env/web.dev.env
cp infra/env/backend.dev.env.example infra/env/backend.dev.env
```

Completá los tres archivos. Para Neon, usá la URL con pooler en `DATABASE_URL` y
la conexión directa en `DIRECT_URL`. Los archivos reales están ignorados por Git.

Iniciá sesión en el registry una vez dentro del nodo para que pueda descargar
imágenes privadas:

```bash
echo "$CONTAINER_REGISTRY_PASSWORD" | docker login "$CONTAINER_REGISTRY" -u "$CONTAINER_REGISTRY_USER" --password-stdin
```

## 4. Aplicar migraciones

Las migraciones no se ejecutan automáticamente. Una vez publicada la imagen del
backend, se pueden aplicar contra Neon desde el nodo con:

```bash
CONTAINER_REGISTRY=<registry/namespace>
docker run --rm \
  --env-file /etc/cabildo/backend.dev.env \
  "$CONTAINER_REGISTRY/backend:dev-latest" \
  pnpm --filter backend exec prisma migrate deploy --config prisma.config.ts
```

## 5. Desplegar

Ejecutá localmente:

```bash
./infra/scripts/deploy-dev.sh
```

El script compila, prueba y publica ambas imágenes, copia solamente los archivos
del entorno de desarrollo y actualiza el proyecto Compose `cabildo-dev`.

Para omitir temporalmente los tests durante un diagnóstico:

```bash
SKIP_TESTS=1 ./infra/scripts/deploy-dev.sh
```

## Diagnóstico

En el nodo:

```bash
CONTAINER_REGISTRY=<registry/namespace> docker compose \
  -f /opt/cabildo-dev/infra/compose/docker-compose.dev.yml ps

CONTAINER_REGISTRY=<registry/namespace> docker compose \
  -f /opt/cabildo-dev/infra/compose/docker-compose.dev.yml logs --tail=100 web backend
```

Desde cualquier equipo:

```bash
curl -fsS https://dev.cabildoabierto.ar/
curl -fsS 'https://dev.cabildoabierto.ar/api/topics?search='
```
