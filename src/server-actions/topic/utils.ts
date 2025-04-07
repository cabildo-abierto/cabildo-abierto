import {db} from "@/db"


export function setTopicCategories(topicId: string, categories: string[]){
    let updates = []
    updates.push(db.topicToCategory.deleteMany({
        where: { topicId: topicId }
    }))

    updates.push(db.topic.update({
        where: { id: topicId },
        data: {
            categories: {
                create: categories.map(cat => ({
                    category: {
                        connectOrCreate: {
                            where: { id: cat },
                            create: { id: cat }
                        }
                    }
                }))
            }
        }
    }))
    return updates
}


export function setTopicSynonyms(topicId: string, synonyms: string[]){

    return [db.topic.update({
        data: {
            synonyms
        },
        where: { id: topicId }
    })]
}