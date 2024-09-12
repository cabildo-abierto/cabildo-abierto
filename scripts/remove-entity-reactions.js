
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();


(async () => {
    const contents = await db.content.findMany({
        select: {
            id: true,
            type: true,
            reactions: true,
            views: true,
            uniqueViewsCount: true,
        }
    })
    const entities = await db.entity.findMany({
        select: {
            id: true,
            uniqueViewsCount: true
        }
    })

    /*for(let i = 0; i < contents.length; i++) {
        const content = contents[i]
        if(content.type != "EntityContent") continue
        if(content.reactions.length > 0){
            console.log("removing reactions of", i, content.id)
            db.reaction.deleteMany({
                where: {
                    contentId: content.id
                }
            })
        }
        if(content.views.length > 0){
            console.log("removing views of", i, content.id)
            await db.view.deleteMany({
                where: {
                    contentId: content.id
                }
            })
        }
    }*/

    for(let i = 0; i < contents.length; i++) {
        const content = contents[i]

        if(content.uniqueViewsCount == null){
            console.log("setting content unique count view", contents[i].id)
            await db.content.update({
                data: {
                    uniqueViewsCount: 0
                },
                where: {
                    id: content.id
                }
            })
            if(content.views.length > 0){
                console.log("removing views of", i, content.id)
                await db.view.deleteMany({
                    where: {
                        contentId: content.id
                    }
                })
                if(content.type != "EntityContent") continue
            }
        }
    }


    /*for(let i = 0; i < contents.length; i++) {
        const content = contents[i]
        if(content.type != "EntityContent") continue
        if(content.uniqueViewsCount == null){
            console.log("setting unique views count of", content.id)
            await db.content.update({
                data: {
                    uniqueViewsCount: 0
                },
                where: {
                    id: content.id
                }
            })
        }
    }


    for(let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        if(entity.uniqueViewsCount == null){
            console.log("setting unique views count of", entity.id)
            await db.entity.update({
                data: {
                    uniqueViewsCount: 0
                },
                where: {
                    id: entity.id
                }
            })
        }
    }*/
})();
