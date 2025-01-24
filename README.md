## Organización del código

 - src/app: frontend de cada ruta.
 - src/components: componentes usadas por el frontend.
 - src/actions: server actions (backend).
 - prisma/schema.prisma: esquema de prisma.
 - src/lexicons: definiciones de los [lexicons de ATProto](https://atproto.com/specs/lexicon).
 - src/public: imágenes y otros archivos multimedia.
 - src/hooks: hooks de [SWR](https://swr.vercel.app).

## Setup

### Instalar

Clonar el repositorio y desde la raíz ejecutar:
```bash
npm install
```

### Arrancar el servidor de desarrollo

```bash
npm run dev
```
**Para que funcione además hay que tener los archivos .env y el .env.local.**

### Build
```
npm run build
```

## Base de datos

### Generar el cliente localmente

```
npx prisma generate
```

### Pushear cambios en el esquema a la base de datos

```
npx prisma db push
```
