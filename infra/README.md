# Paso a paso para configurar un nuevo nodo app

## Variables

Para deployar desde tu máquina local:

```
cp infra/env/deploy.env.example infra/env/deploy.env
```

Editá `infra/env/deploy.env`:

```
DEPLOY_SERVER="deploy@<ip-o-host>"
CONTAINER_REGISTRY="<registry>/<namespace>"
CONTAINER_REGISTRY_USER="<registry-user>"
CONTAINER_REGISTRY_PASSWORD="<registry-token>"
PROD_BACKEND_URL="https://api.cabildoabierto.ar"
TEST_BACKEND_URL="https://test-api.cabildoabierto.ar"
```

`infra/env/deploy.env` no se commitea. También podés usar otro archivo con `DEPLOY_ENV_FILE=/ruta/al/env`.

`CONTAINER_REGISTRY_PASSWORD` puede omitirse si `VULTR_API_KEY` ya tiene el token del registry.

Para que cada deploy exitoso elimine artifacts antiguos del Container Registry,
configurá `VULTR_ACCOUNT_API_KEY` con una API key de la cuenta de Vultr. Esta key
es distinta del token usado por `docker login`. Por defecto se conservan cinco
artifacts SHA por ambiente y repositorio, además de cualquier artifact con un tag
`*-latest` o no reconocido. Se puede cambiar con `REGISTRY_KEEP_ARTIFACTS` o
desactivar con `SKIP_REGISTRY_CLEANUP=1`. La limpieza requiere `curl` y `jq` en
la computadora desde la que se ejecuta el deploy.

Para vaciar por completo el registry, incluidos todos los tags `latest` y
manuales, ejecutá `infra/scripts/cleanup-vultr-registry.sh --all`. El comando
exige escribir el nombre del registry como confirmación y no se ejecuta como
parte de un deploy normal.

El deploy también limpia del nodo las imágenes y el caché Docker sin uso de más
de siete días. Se desactiva con `SKIP_NODE_CLEANUP=1` o se cambia el período con
`DOCKER_PRUNE_UNTIL`.

Deploy de producción con el stack mínimo:

```
./infra/scripts/deploy.sh prod web min
```

Deploy de la vista "Paciencia, por favor" sin deployar backend:

```
./infra/scripts/deploy.sh prod web min wip
```

Volver a deployar la app real:

```
./infra/scripts/deploy.sh prod web min app
```

Deploy aislado de test (`web` + `backend`) en `test.cabildoabierto.ar`, con la
API publicada bajo `/api`:

```
./infra/scripts/deploy.sh dev all
```

Al incluir el backend, el deploy ejecuta las migraciones pendientes con la imagen
nueva antes de activar los contenedores. Un fallo cancela el deploy y deja el
servicio anterior activo. En `prod` y `test`, el contenedor temporal usa la red
`cabildo-dev_default` si existe, o `bridge`; configurá `MIGRATION_NETWORK` en
`infra/env/deploy.env` si la base requiere otra red Docker. Los deploys solo de
web no ejecutan migraciones.

Este entorno usa Docker Compose, `127.0.0.1:3002` para web y
`127.0.0.1:8082` para backend, sin modificar el stack mínimo existente. Ver
[`DEV_DEPLOY.md`](./DEV_DEPLOY.md) para la preparación inicial del nodo.

1. Crear el nodo y configurar el VPS
2. Clonar el repositorio
```ssh root@YOUR_VPS_IP
mkdir -p /opt
cd /opt
git clone https://github.com/<org>/<repo>.git cabildo
cd /opt/cabildo
```

3. Copiar los .env

Desde el root del repositorio local:
```
scp infra/env/web.env.prod infra/env/docmost.env.prod root@YOUR_NEW_VPS_IP:/etc/cabildo/
```

Desde el VPS:
```
mkdir -p /etc/cabildo
mv /etc/cabildo/web.env.prod /etc/cabildo/web.env && mv /etc/cabildo/docmost.env.prod /etc/cabildo/docmost.env && chmod 600 /etc/cabildo/*.env
```

4. Certificados de Cloudflare
```
mkdir -p /etc/ssl/certs /etc/ssl/private
chmod 755 /etc/ssl/certs
chmod 700 /etc/ssl/private

-- Copiar key y cert

chown root:root /etc/ssl/certs/cabildo-origin.pem /etc/ssl/private/cabildo-origin.key
chmod 644 /etc/ssl/certs/cabildo-origin.pem
chmod 600 /etc/ssl/private/cabildo-origin.key

```
