# Paso a paso para configurar un nuevo nodo app

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