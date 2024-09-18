const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

(async () => {
  const usernames = ["guest25", "prueba", "prueba2", "prueba4", "prueba5", "prueba6", "prueba7", "prueba8"]

  usernames.forEach(async (user) => {
    await db.content.updateMany({
      where: { authorId: user},
      data: { authorId: "tomas"}
    })

    await db.subscription.updateMany({
      where: { boughtByUserId: user},
      data: { boughtByUserId: "tomas"}
    })

    try {
      await db.view.deleteMany({
        where: {userById: user}
      })
    } catch {}

    await db.user.delete({
      where: { id: user}
    })
  })
})();
