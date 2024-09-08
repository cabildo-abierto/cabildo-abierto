import diceCoefficientDistance from "src/actions/dice-coefficient";
import { EntityProps, SmallContentProps, SmallEntityProps } from "src/app/lib/definitions";

function included(a: string, b: string){
    return b.toLowerCase().includes(a.toLowerCase())
}

export function searchUsers(value: string, users: {id: string, name: string}[]) {
    if(value.length == 0)
        return []

    users = users.filter(({id, name}) => {
        return included(value, name) || included(value, id)
    })
    
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

    contents = contents.filter(({id, text}) => {
        return included(value, text) || included(value, id)
    })

    const dist = diceCoefficientDistance

    const maxDist = dist(value, '')
    const dists: {id: string, dist: number}[] = []

    contents.forEach(function(item){
        let d = dist(value, item.text)
        dists.push({id: item.id, dist: d})
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
    
    entities = entities.filter(({id, name}) => {
        return included(value, name) || included(value, id)
    })
    
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