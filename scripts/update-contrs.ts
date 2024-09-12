import { charDiffFromJSONString } from "../src/components/diff";

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
        if(entity.name != "Cabildo Abierto") continue
        console.log("updating", entity.id, "number", i, "out of", entities.length)

        let accCharsAdded = 0
        const authorAccCharsAdded = new Map<string, number>()

        for(let j = 0; j < entity.versions.length; j++){
            const {charsAdded, charsDeleted} = j == 0 ? {charsAdded: 0, charsDeleted: 0} :
                charDiffFromJSONString(entity.versions[j-1].text, entity.versions[j].text)
            
            accCharsAdded += charsAdded
            
            const author = entity.versions[j].authorId
            if(authorAccCharsAdded.has(author)){
                authorAccCharsAdded.set(author, authorAccCharsAdded.get(author) + charsAdded)
            } else {
                authorAccCharsAdded.set(author, charsAdded)
            }
            
            await db.content.update({
                data: {
                    contribution: JSON.stringify(Array.from(authorAccCharsAdded)),
                    accCharsAdded: accCharsAdded,
                    charsAdded: charsAdded,
                    charsDeleted: charsDeleted,
                },
                where: {
                    id: entity.versions[j].id
                }
            })
            console.log("finished sending update to version", j)
        }
    }
})();
