# Deploy de test en un nodo Vultr

Este despliegue es independiente de los stacks existentes. Ejecuta únicamente una
réplica de `web` y una de `backend` con Docker Compose. Nginx publica ambos bajo:

- Web: `https://test.cabildoabierto.ar`
- Backend: `https://test.cabildoabierto.ar/api`

Los puertos de las aplicaciones quedan ligados a `127.0.0.1:3002` y
`127.0.0.1:8082`, por lo que no se exponen directamente a Internet ni interfieren
con el stack mínimo existente, que usa el puerto `3000`.

## 1. DNS y TLS

El registro DNS de `test.cabildoabierto.ar` debe apuntar al nodo. La configuración
reutiliza el certificado de origen existente de Cabildo:

```text
/etc/ssl/certs/cabildo-origin.pem
/etc/ssl/private/cabildo-origin.key
```

## 2. Preparar el nodo existente

Creá el directorio aislado para Compose. No vuelvas a ejecutar la preparación
general del nodo ni deshabilites la configuración de producción:

```bash
sudo mkdir -p /opt/cabildo-dev/env
sudo chown -R deploy:deploy /opt/cabildo-dev
```

Después del primer deploy, instalá la configuración Nginx sincronizada, validala
y recargá el servicio:

```bash
sudo cp /opt/cabildo-dev/infra/nginx/sites-available/cabildo /etc/nginx/sites-available/cabildo
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

El usuario configurado en `DEPLOY_SERVER` debe poder ejecutar Docker y escribir
en `/opt/cabildo-dev`. Una opción es agregarlo al grupo Docker y darle propiedad
solamente sobre ese directorio aislado de desarrollo:

```bash
sudo usermod -aG docker deploy
sudo chown -R deploy:deploy /opt/cabildo-dev
```

Cerrá y volvé a abrir la sesión SSH para aplicar el grupo nuevo.

## 3. Configurar el deploy local

Desde la raíz del repositorio:

```bash
cp infra/env/deploy.env.example infra/env/deploy.env
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

## 4. Migraciones

Al desplegar el backend, el script descarga la imagen nueva y ejecuta una sola vez
las migraciones pendientes antes de actualizar el servicio. Usa `DIRECT_URL` (o
`DATABASE_URL` si falta) de `backend.dev.env`. Si una migración falla, el deploy
termina con error y el backend anterior sigue activo. Cada migración se ejecuta
dentro de una transacción: la migración que falla se revierte; las anteriores
que ya se confirmaron permanecen aplicadas.
Si `backend.dev.env` apunta a la base de producción, este deploy aplicará las
migraciones allí.

## 5. Desplegar

Ejecutá localmente:

```bash
./infra/scripts/deploy.sh dev all
```

El script compila, prueba y publica ambas imágenes, copia solamente los archivos
del entorno de desarrollo y actualiza el proyecto Compose `cabildo-dev`.

Para omitir temporalmente los tests durante un diagnóstico:

```bash
SKIP_TESTS=1 ./infra/scripts/deploy.sh dev all
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
curl -fsS https://test.cabildoabierto.ar/
curl -fsS 'https://test.cabildoabierto.ar/api/topics?search='
```
