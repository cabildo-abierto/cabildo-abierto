
## Para hacer

## Cambiar esquema de la base de datos

npx prisma db push

## Setup

Instalar MUI
```bash
npm install @mui/material-nextjs @emotion/cache @emotion/server
```

Arrancar el servidor de desarrollo.
```bash
npm run dev
```

Instalar Roboto
```bash
npm install @fontsource/roboto
```

### Postgres

sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql.service
sudo -u postgres psql
\qs
npx prisma migrate dev --name init

### Prisma

Generar cliente de Prisma para el modelo actual
npx prisma generate
npx prisma db push
