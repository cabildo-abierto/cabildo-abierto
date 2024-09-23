import Link from "next/link"
import { Authorship } from "./content"
import { DateSince } from "./date"
import { UndoButton } from "./undo-button"
import LoadingSpinner from "./loading-spinner"
import { ContentProps, EntityProps } from "../app/lib/definitions"
import { useContent } from "../app/hooks/contents"
import { useRouter } from "next/navigation"
import { AuthorshipClaimIcon, NoAuthorshipClaimIcon } from "./icons"
import { useState } from "react"
import StateButton from "./state-button"
import { useUser } from "../app/hooks/user"
import { removeEntityAuthorship } from "../actions/entities"
import { User } from "mercadopago"

const EditDetails = ({content, prev}: {content: ContentProps, prev: ContentProps | undefined}) => {
    if(!prev){
        return <span>Creación</span>
    } else {
        if(content.text != prev.text){
            return <span>Contenido</span>
        } else if(content.categories != prev.categories){
            return <span>Categorías</span>
        } else {
            return <span>Sin cambios</span>
        }
    }
}

type EditElementProps = {
    entity: EntityProps,
    index: number,
    viewing?: number,
    isCurrent: boolean
}


const AuthorshipClaim = ({entity, version, setShowingRemoveAuthorshipPanel}: {entity: EntityProps, version: number, setShowingRemoveAuthorshipPanel: (v: boolean) => void}) => {
    const {user} = useUser()
    if(version == 0) return <div className="w-32"></div>
    if(entity.versions[version].categories != entity.versions[version-1].categories){
        return <div className="w-32"></div>
    }
    if(entity.versions[version].claimsAuthorship && user.id == entity.versions[version].authorId){
        return <button className="underline hover:text-[var(--primary)] text-xs"
            onClick={(e) => {e.preventDefault(); e.stopPropagation(); setShowingRemoveAuthorshipPanel(true)}}
        >
            Remover autoría
        </button>
    } else {
        return <span className="text-xs text-center">No reclama autoría</span>
    }
}


const EditElement = ({entity, index, viewing, isCurrent}: EditElementProps) => {
    const [showingRemoveAuthorshipPanel, setShowingRemoveAuthorshipPanel] = useState(false)
    const content = useContent(entity.versions[index].id)
    let prev = useContent(entity.versions[Math.max(index-1, 0)].id)
    const router = useRouter()

    if(content.isLoading || prev.isLoading) return <LoadingSpinner/>
    if(!content.content) return <></>

    const selected = viewing == index

    const isUndo = content.content.isUndo

    const className = "flex flex-col article-edit my-2 w-full px-2 pb-2 link hover:bg-[var(--secondary-light)] cursor-pointer " + (selected ? " selected" : "")

    async function onRemoveAuthorship(){
        await removeEntityAuthorship(entity.versions[index].id, entity.id)
    }

    return <div className={className}
        onClick={() => {router.push("/articulo/"+entity.id+"/"+index)}}
    >
        {showingRemoveAuthorshipPanel && <RemoveAuthorshipPanel
            entity={entity}
            version={index}
            onRemove={onRemoveAuthorship}
            onClose={() => {setShowingRemoveAuthorshipPanel(false)}}
        />}
        <div className="flex justify-center mt-2 items-center">
            <div className="text-sm font-bold mr-2 w-32">
                {isUndo ? <span>(Deshecho)</span> : 
                isCurrent ? <span>(Versión actual)</span> : <></>
                }
            </div>
            <div className="mr-2 w-24 text-sm">(<DateSince date={content.content.createdAt}/>)</div>
            <div className="mr-2 w-32 text-sm"><Authorship content={content.content} onlyAuthor={true}/></div>
            <div className="w-32 text-sm">
            <EditDetails content={content.content} prev={index > 0 ? prev.content : undefined}/>
            </div>
            <div className="w-32 ml-2">
                {isCurrent && index > 0 ? <UndoButton entity={entity} version={index}/> : <></>}
            </div>
            <AuthorshipClaim entity={entity} version={index} setShowingRemoveAuthorshipPanel={setShowingRemoveAuthorshipPanel}/>
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


export const RemoveAuthorshipPanel = ({ entity, version, onClose, onRemove }: {entity: EntityProps, onClose: () => void, version: number, onRemove: () => void}) => {
    const {user} = useUser()

    return (
        <>
            <div className="fixed inset-0 bg-opacity-50 bg-gray-800 z-10 flex justify-center items-center backdrop-blur-sm">
                
                <div className="bg-[var(--background)] rounded border-2 border-black p-4 z-10 text-center max-w-lg">
                    <h2 className="py-4 text-lg">Remover autoría de esta versión</h2>
                    <div className="mb-8">
                        {user.id == entity.versions[version].authorId ? <>Estás por remover la autoría de la modificación que hiciste.</> : <>Estás por remover la autoría de la modificacióm de @{entity.versions[version].authorId}.</>}
                    </div>
                    <div className="flex justify-center items-center space-x-4 mt-4">
                        <button
                            className="gray-btn w-48"
                            onClick={async () => {onClose()}}
                        >
                            Volver
                        </button>
                        <StateButton
                            className="gray-btn w-48"
                            onClick={async (e) => {e.preventDefault(); e.stopPropagation(); await onRemove(); onClose()}}
                            text1="Confirmar"
                            text2="Removiendo..."
                        />
                    </div>
                </div>
            </div>
        </>
    );
};



export const EditHistory = ({entity, viewing}: {entity: EntityProps, viewing?: number}) => {
    const currentIndex = currentVersion(entity)

    return <>
        {entity.versions.map((version, index) => {
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
