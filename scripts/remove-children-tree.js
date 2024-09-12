
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const cache = new Map()

async function getContentWithParentAndType(id){
    if(cache.has(id)){
        return cache.get(id)
    }
    let content = await db.content.findUnique({
        select: {
            id: true,
            type: true,
            parentContents: {
                select: {id: true}
            }
        },
        where: {
            id: id,
        }
    })
    cache.set(id, content)
    return content
}

async function getAncestors(id){
    const ancestors = []

    let content = await getContentWithParentAndType(id)
    while(content.type == "Comment" || content.type == "FakeNewsReport"){
        content = await getContentWithParentAndType(content.parentContents[0].id)
        ancestors.push({id: content.id})
    }

    return ancestors
}

(async () => {
    const contents = await db.content.findMany({
        select: {
            id: true,
            type: true,
            rootContentId: true,
            ancestorContent: {
                select: {id: true}
            }
        }
    })

    for(let i = 0; i < contents.length; i++) {
        const content = contents[i]
        if(content.rootContentId != null && content.rootContentId == content.id){
            console.log("removing rootContentId to", i)
            await db.content.update({
                data: {
                    rootContentId: null
                },
                where: {
                    id: content.id
                }
            })
        }
        /*if(content.ancestorContent.length > 0){
            await db.content.update({
                data: {
                    ancestorContent: {
                        disconnect: true
                    }
                }
            })
        }*/
    }

    /*for(let i = 0; i < contents.length; i++) {
        const content = contents[i]

        if(content.rootContentId != null) continue;

        if(content.type != "Comment" && content.type != "FakeNewsReport"){
            console.log(i, content.id, "setting root to itself")
            await db.content.update({
                data: {
                    rootContent: {
                        connect: {id: content.id}
                    }
                },
                where: {id: content.id}
            })
            continue;
        }

        const ancestors = await getAncestors(content.id)
        console.log(i, contents[i].id, "ancestors", ancestors)

        await db.content.update({
            data: {
                ancestorContent: {
                    connect: ancestors
                },
                rootContent: {
                    connect: ancestors[ancestors.length-1]
                }
            },
            where: {id: content.id}
        })
    }*/
})();
