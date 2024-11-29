import { revalidateTag } from "next/cache"


export const revalidateEverythingTime = 5//6*3600




export function revalidateReferences(references: {id: string}[]){
    references.forEach(({id}) => {
        revalidateTag("entity:"+id)
    })
}