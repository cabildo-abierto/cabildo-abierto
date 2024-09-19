import { charDiffFromJSONString } from "../src/components/diff";
import { updateEntityContributions } from "../src/components/utils";

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
        if(entity.id != "Cabildo_Abierto%3A_Suscripciones") continue
        console.log("updating", entity.id, "number", i, "out of", entities.length)
        
        await updateEntityContributions(entity)
    }
})();
