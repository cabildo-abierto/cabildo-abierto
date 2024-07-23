const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

(async () => {
  const usernames = ["fdelgado", "fundar", "jdelgado", "magustoni", "prueba", "prueba2", "prueba345"]

  usernames.forEach(async (user) => {
    await db.content.updateMany({
      where: { authorId: "@"+user},
      data: { authorId: "@tdelgado"}
    })

    await db.subscription.updateMany({
      where: { boughtByUserId: "@"+user},
      data: { boughtByUserId: "@tdelgado"}
    })

    await db.content.delete({
      where: { id: "@"+user}
    })
    console.log("deleted", user)
  })
})();
