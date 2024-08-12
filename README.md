## Setup

### Instalar

Descargar el repo y desde la raíz ejecutar:
```bash
npm install
npx prisma generate // No estoy seguro de si hace falta
```

### Arrancar el servidor de desarrollo

```bash
npm run dev
```
Para que funcione además hay que tener el .env

### Build
```
npm run build
```

### Actualizar el esquema de la base de datos
```
npx prisma generate
npx prisma db push
```
