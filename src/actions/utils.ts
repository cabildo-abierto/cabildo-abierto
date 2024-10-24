import { revalidateTag } from "next/cache"


export const revalidateEverythingTime = 6*3600




export function revalidateReferences(entityReferences: {id: string}[], weakReferences: {id: string}[]){
    entityReferences.forEach(({id}) => {
        revalidateTag("entity:"+id)
    })
    
    weakReferences.forEach(({id}) => {
        revalidateTag("entity:"+id)
    })
}