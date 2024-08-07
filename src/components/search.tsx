import diceCoefficientDistance from "@/actions/dice-coefficient";
import { getEntities } from "@/actions/get-entity";
import { getUsers } from "@/actions/get-user";
import { getContentsMap, getEntitiesMap } from "./update-context";
import { ContentProps } from "@/actions/get-content";


export async function searchUsers(value: string) {
    if(value.length == 0)
        return []

    const users = await getUsers()
    
    const dist = diceCoefficientDistance

    const maxDist = dist(value, '')
    const dists: {id: string, dist: number}[] = []
    users.forEach(function(item){
        let d = 1e10
        if(item.name) {
            d = dist(value, item.name)
        }
        d = Math.min(d, dist(value, item.id))
        dists.push({id: item.id, dist: d})
    })

    dists.sort((a, b) => {return a.dist - b.dist })
    dists.filter((a) => {return a.dist < maxDist})
    return dists
}


export async function searchContents(value: string) {
    if(value.length == 0)
        return []

    const contents = await getContentsMap()

    const dist = diceCoefficientDistance

    const maxDist = dist(value, '')
    const dists: {id: string, dist: number}[] = []

    Object.values(contents).forEach(function(item){
        if(item.type == "Post" || item.type == "Comment" || item.type == "FastPost"){
            if(!item.isDraft){
                let d = dist(value, item.text)
                dists.push({id: item.id, dist: d})
            }
        }
    })

    dists.sort((a, b) => {return a.dist - b.dist })
    dists.filter((a) => {return a.dist < maxDist})

    const orderedContents: ContentProps[] = []
    dists.forEach(({id, dist}: {id: string, dist: number}) => {
        orderedContents.push(contents[id])
    })

    return orderedContents
}


export async function searchEntities(value: string){
    if(value.length == 0)
        return []

    const entities = await getEntitiesMap()
    const contents = await getContentsMap()

    const dist = diceCoefficientDistance

    const maxDist = dist(value, '')
    const dists: {id: string, dist: number}[] = []

    Object.values(entities).forEach(function(item){
        let d = 1e10
        if(item.name) {
            d = dist(value, item.name)
        }
        dists.push({id: item.id, dist: d})
    })

    dists.sort((a, b) => {return a.dist - b.dist })
    dists.filter((a) => {return a.dist < maxDist})

    const results: any[] = []
    dists.forEach(({id, dist}: {id: string, dist: number}) => {
        results.push({content: contents[entities[id].contentId], entity: entities[id], id: id})
    })

    return results
}