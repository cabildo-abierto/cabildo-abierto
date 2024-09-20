import { currentVersion } from "../src/components/edit-history";

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();


(async () => {
    const entities = await db.entity.findMany({
        select: {
            id: true,
            name: true,
            versions: {
                select: {
                    id: true,
                    text: true,
                    authorId: true
                },
                orderBy: {
                    createdAt: "asc"
                }
            }
        }
    })

    for(let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        console.log("updating", entity.id, "number", i, "out of", entities.length)

        const currentVersionIndex = currentVersion(entity)

        await db.entity.update({
            data: {
                currentVersionId: entity.versions[currentVersionIndex].id,
            },
            where: {
                id: entity.id
            }
        })
    }
})();
