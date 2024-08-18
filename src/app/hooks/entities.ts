import { ContentProps } from "@/actions/get-content"
import { EntityProps } from "@/actions/get-entity"
import { fetcher } from "@/app/hooks/utils"
import useSWR from "swr"


export function useEntity(id: string): {entity: EntityProps, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/entity/'+id, fetcher)
  
    return {
        entity: data,
        isLoading,
        isError: error
    }
}


export function useEntities(): {entities: EntityProps[], isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/entities', fetcher)
  
    return {
        entities: data,
        isLoading,
        isError: error
    }
}



/*const version = entity ? (searchParams.version && typeof searchParams.version == 'string') ? Number(searchParams.version as string) : entity.versions.length-1
const content = entity ? useContent(entity.versions[version].id) : null


export function useEntityAndLastVersion(id: string): {entity: EntityProps | null, content: ContentProps | null, isLoading: boolean, isError: boolean}{
    const { data, error, isLoading } = useSWR('/api/entity/'+id, fetcher)
    if(isLoading || error){
        return {
            entity: null,
            content: null,
            isLoading,
            isError: error
        }
    }

    const lastVersionId()

    const { content, error2, isLoading2 } = useContent()

    return {
        entity: data,
        content: content,
        isLoading: isLoading || isLoading2,
        isError: error || error2
    }
}
*/