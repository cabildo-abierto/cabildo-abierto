import { revalidateTag } from "next/cache"


export const revalidateEverythingTime = 5




export function revalidateReferences(entityReferences: {id: string}[], weakReferences: {id: string}[]){
    entityReferences.forEach(({id}) => {
        revalidateTag("entity:"+id)
    })
    
    weakReferences.forEach(({id}) => {
        revalidateTag("entity:"+id)
    })
}