
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();


(async () => {
    const contents = await db.content.findMany({
        select: {
            id: true,
            views: true,
            uniqueViewsCount: true,
        }
    })
    const entities = await db.entity.findMany({
        select: {
            id: true,
            uniqueViewsCount: true,
            views: true
        }
    })

    /*for(let i = 0; i < contents.length; i++) {
        const content = contents[i]
        const uniqueViewsCount = new Set(content.views.map(({userById}) => (userById))).size
        if(uniqueViewsCount != content.uniqueViewsCount){
            console.log(i, "updating unique views count of", content.id)
            db.content.update({
                data: {
                    uniqueViewsCount: uniqueViewsCount
                },
                where: {
                    id: content.id
                }
            })
        }
    }*/

    for(let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        const uniqueViewsCount = new Set(entity.views.map(({userById}) => (userById))).size
        if(uniqueViewsCount != entity.uniqueViewsCount){
            console.log(i, "updating unique views count of", entity.id)
            db.entity.update({
                data: {
                    uniqueViewsCount: uniqueViewsCount
                },
                where: {
                    id: entity.id
                }
            })
        }
    }
})();
