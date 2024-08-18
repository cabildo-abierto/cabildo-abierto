import diceCoefficientDistance from "@/actions/dice-coefficient";
import { EntityProps } from "@/actions/get-entity";
import { SmallContentProps } from "@/app/api/feed/route";


export function searchUsers(value: string, users: {id: string, name: string}[]) {
    if(value.length == 0)
        return []
    
    const dist = diceCoefficientDistance

    const maxDist = dist(value, '')
    const dists: any[] = []
    users.forEach(function(item){
        let d = 1e10
        if(item.name) {
            d = dist(value, item.name)
        }
        d = Math.min(d, dist(value, item.id))
        dists.push({id: item.id, dist: d, name: item.name})
    })

    dists.sort((a, b) => {return a.dist - b.dist })
    dists.filter((a) => {return a.dist < maxDist})

    return dists
}


export function searchContents(value: string, contents: SmallContentProps[]) {
    if(value.length == 0)
        return []

    const dist = diceCoefficientDistance

    const maxDist = dist(value, '')
    const dists: {id: string, dist: number}[] = []

    contents.forEach(function(item){
        if(item.type == "Post" || item.type == "Comment" || item.type == "FastPost"){
            if(!item.isDraft){
                let d = dist(value, item.text)
                dists.push({id: item.id, dist: d})
            }
        }
    })

    dists.sort((a, b) => {return a.dist - b.dist })
    dists.filter((a) => {return a.dist < maxDist})

    const orderedContents: {id: string}[] = []
    dists.forEach(({id, dist}: {id: string, dist: number}) => {
        orderedContents.push({id: id})
    })

    return orderedContents
}


export function searchEntities(value: string, entities: EntityProps[]){
    if(value.length == 0)
        return []

    const dist = diceCoefficientDistance

    const maxDist = dist(value, '')
    const dists: {id: string, dist: number, name: string}[] = []

    entities.forEach(function(item){
        let d = 1e10
        if(item.name) {
            d = dist(value, item.name)
        }
        dists.push({id: item.id, dist: d, name: item.name})
    })

    dists.sort((a, b) => {return a.dist - b.dist })
    dists.filter((a) => {return a.dist < maxDist})

    return dists
}