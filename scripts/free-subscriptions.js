const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

(async () => {
    const count = 1
    for(let i = 0; i < count; i++){
        await db.subscription.create({
            data: {
                boughtByUserId: "tomas",
                price: 0
            }
        })
    }
})();
