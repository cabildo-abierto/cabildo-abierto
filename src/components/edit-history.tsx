import Link from "next/link"
import { Authorship } from "./content"
import { DateSince } from "./date"
import { UndoButton } from "./undo-button"
import LoadingSpinner from "./loading-spinner"
import { ContentProps, EntityProps } from "../app/lib/definitions"
import { useContent } from "../app/hooks/contents"

const EditDetails = ({content, prev}: {content: ContentProps, prev: ContentProps | undefined}) => {
    if(!prev){
        return <span>Creación del artículo</span>
    } else {
        if(content.text != prev.text){
            return <span>Modificación del contenido</span>
        } else if(content.categories != prev.categories){
            return <span>Modificación de las categorías</span>
        } else {
            return <span>No cambió nada: {content.id}</span>
        }
    }
}

type EditElementProps = {
    entity: EntityProps,
    index: number,
    viewing?: number,
    isCurrent: boolean
}

const EditElement = ({entity, index, viewing, isCurrent}: EditElementProps) => {
    const content = useContent(entity.versions[index].id)
    let prev = useContent(entity.versions[Math.max(index-1, 0)].id)

    if(content.isLoading || prev.isLoading) return <LoadingSpinner/>
    if(!content.content) return <></>

    const selected = viewing == index

    const isUndo = content.content.isUndo

    return <div className={"flex flex-col article-edit my-2 w-full px-2 pb-2 link" + (selected ? " selected" : "")}>
        <div className="flex justify-center mt-2 items-center">
            <div className="text-sm font-bold mr-2 w-32">
                {isUndo ? <span>(Deshecho)</span> : 
                isCurrent ? <span>(Versión actual)</span> : <></>
                }
            </div>
            <div className="mr-2 w-24">(<DateSince date={content.content.createdAt}/>)</div>
            <div className="mr-2 w-32"><Authorship content={content.content} onlyAuthor={true}/></div>
            <div className="w-32">
            <EditDetails content={content.content} prev={index > 0 ? prev.content : undefined}/>
            </div>
            <Link className="ml-2" href={"/articulo/"+entity.id+"/"+index}>
                Ver versión
            </Link>
            <div className="w-32 ml-2">
                {isCurrent && index > 0 ? <UndoButton entity={entity} version={index}/> : <></>}
            </div>
        </div>
    </div>
}

export function currentVersion(entity: EntityProps){
    let currentIndex = entity.versions.length-1
    while(entity.versions[currentIndex].isUndo){
        currentIndex --
    }
    return currentIndex
}


export const EditHistory = ({entity, viewing}: {entity: EntityProps, viewing?: number}) => {

    const currentIndex = currentVersion(entity)

    return <>{entity.versions.map((version, index) => {
        const versionIndex = entity.versions.length-1-index
        return <div key={index}>
            <EditElement
                entity={entity}
                index={versionIndex}
                viewing={viewing}
                isCurrent={versionIndex == currentIndex}
            />
        </div>
    })}</>
}
