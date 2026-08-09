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
