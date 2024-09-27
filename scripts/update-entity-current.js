
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();


const permissionToNumber = (level) => {
    if(level == "Administrator"){
        return 2
    } else if(level == "Beginner"){
        return 0
    } else if(level == "Editor"){
        return 1
    }
}


const hasEditPermission = (user, level) => {
    return permissionToNumber(user.editorStatus) >= permissionToNumber(level)
}


(async () => {
    const entities = await db.entity.findMany({
        select: {
            id: true,
            uniqueViewsCount: true,
            views: true,
            versions: {
                select: {
                    id: true,
                    author: {
                        select: {
                            editorStatus: true,
                        }
                    },
                    editPermission: true
                },
                orderBy: {
                    createdAt: "asc"
                }
            },
            protection: true
        }
    })

    for(let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        console.log(i, "updating current version of", entity.id)
        for(let j = 0; j < entity.versions.length; j++){
            const version = entity.versions[j]
            const permission = hasEditPermission(version.author, entity.protection)
            if(permission != version.editPermission){
                console.log(i, "changing edit permission of version", version)
                await db.content.update({
                    data: {
                        editPermission: permission
                    },
                    where: {
                        id: version.id
                    }
                })
            }
        }

        let index = 0
        for(let i = 0; i < entity.versions.length; i++){
            if(!entity.versions[i].isUndo && entity.versions[i].editPermission){
                index = i
            }
        }
        if(entity.currentVersionId != entity.versions[index].id){
            console.log("updating entity current version to", index)
            await db.entity.update({
                data: {
                    currentVersionId: entity.versions[index].id
                },
                where: {
                    id: entity.id
                }
            })
        }
    }
})();
