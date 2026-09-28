# Base de desarrollo local

La base `cabildo_dev` corre en Docker y escucha solo en `127.0.0.1:5434`. Su contraseña está en `infra/compose/.env`, ignorado por Git. El backend local usa esa misma conexión en `apps/backend/.env`.

Desde la raíz del repositorio:

```bash
docker compose --env-file infra/compose/.env -f infra/compose/docker-compose.local-db.yml up -d --wait
docker compose --env-file infra/compose/.env -f infra/compose/docker-compose.local-db.yml down
```

El volumen `cabildo-local-db_postgres_data` conserva los datos al detener el contenedor. Inicialmente se restauró un dump de la base Neon dev. El dump original sigue guardado en el block storage del servidor, bajo `/mnt/cabildo-storage/cabildo-postgres/neon-migration`.

Para simular una base más lenta, agregá `DEV_DB_LATENCY_MS=300` a `apps/backend/.env` y reiniciá el backend local. El valor está en milisegundos y añade una espera a cada consulta de Kysely antes de entregar el resultado. `0` (valor predeterminado) desactiva la demora. Solo se aplica con `NODE_ENV=development`.

El despliegue remoto de test es independiente de esta base local. Su backend usa `cabildo_prod` en el mismo nodo, a través de la red Docker.
