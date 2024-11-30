import { revalidateTag } from "next/cache"


export const revalidateEverythingTime = 5


export function revalidateReferences(references: {id: string}[]){
    references.forEach(({id}) => {
        revalidateTag("entity:"+id)
    })
}