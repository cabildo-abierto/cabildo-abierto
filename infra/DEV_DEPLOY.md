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

## 4. Aplicar migraciones

Las migraciones no se ejecutan automáticamente. Cuando haya migraciones nuevas,
aplicalas desde el checkout local antes de desplegar el backend:

```bash
read -rsp 'Neon DIRECT_URL: ' DIRECT_URL; echo
export DIRECT_URL
pnpm --filter backend migrate
unset DIRECT_URL
```

La imagen también incluye el migrador: ejecutar `node dist/scripts/apply-migrations.js`
desde `/app`, con las variables de conexión del entorno correspondiente.

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
