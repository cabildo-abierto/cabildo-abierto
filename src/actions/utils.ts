import { revalidateTag } from "next/cache"
import { FeedContentProps } from "../app/lib/definitions"


export const revalidateEverythingTime = 5


export function revalidateReferences(references: {id: string}[]){
    references.forEach(({id}) => {
        revalidateTag("entity:"+id)
    })
}