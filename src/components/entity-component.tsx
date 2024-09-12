"use client"
import React from "react"
import WikiEditor from "./editor/wiki-editor";
import LoadingSpinner from "./loading-spinner";
import Link from "next/link";
import { getAllText } from "./diff";
import { ChangesCounter } from "./changes-counter";
import { ContentTopRow } from "./content";
import { useEntity } from "../app/hooks/entities";
import { useContent } from "../app/hooks/contents";
import { ContentProps, EntityProps } from "../app/lib/definitions";


type EntityComponentProps = {
    content: ContentProps
    entityId: string
    showingChanges?: boolean
    editing?: boolean
    showingAuthors?: boolean
    setEditing: (arg0: boolean) => void
    isMainPage?: boolean
    parentContentId?: string
}


export function getVersionInEntity(contentId: string, entity: EntityProps){
    for(let i = 0; i < entity.versions.length; i++){
        if(entity.versions[i].id == contentId){
            return i
        }
    }
    return null
}

const EntityComponent: React.FC<EntityComponentProps> = ({
    content,
    entityId,
    showingChanges=false,
    editing=false, 
    showingAuthors=false,
    setEditing,
    isMainPage=false,
    parentContentId
}) => {
    const entity = useEntity(entityId)
    if(entity.isLoading){
        return <LoadingSpinner/>
    }
    if(!entity.entity){
        return <>Error :( {entityId}</>
    }
    const version = getVersionInEntity(content.id, entity.entity)

    if(parentContentId){
        const version = getVersionInEntity(content.id, entity.entity)
        if(version != entity.entity.versions.length-1){
            return <></>
        } else {
            return <EntityMentionInCommentSection
                entity={entity.entity}
                mentioningContentId={content.id}
                parentContentId={parentContentId}
            />
        }
    } else if(isMainPage){
        return <div className="px-2 min-h-64">
            <WikiEditor 
                version={version}
                entity={entity.entity}
                showingChanges={showingChanges}
                readOnly={!editing}
                showingAuthors={showingAuthors}
                setEditing={setEditing}
            />
        </div>
    } else {
        return <EntityEditInFeed content={content} entity={entity.entity} version={version}/>
    }
    
}


function findMentionNode(node: any, id: string){
    if(node.type == "link" || node.type == "autolink"){
        const url: string = node.url
        if(url.includes("/articulo/") && url.split("/articulo/")[1] == id)
            return node
    }

    if(!node.children) return null
    for(let i = 0; i < node.children.length; i++){
        const found = findMentionNode(node.children[i], id)
        if(found) return found
    }
}


function findMentionAncestors(node: any, id: string){
    for(let i = 0; i < node.children.length; i++){
        const mentionNode = findMentionNode(node.children[i], id)
        if(mentionNode){
            return [node, ...findMentionAncestors(node.children[i], id)]
        }
    }
    return [node]
}


function findFragment(text: string, id: string){
    const parsed = JSON.parse(text)
    const mentionNode = findMentionNode(parsed.root, id)
    if(!mentionNode){
        return "Parece haber una mención pero no la encontramos"
    }
    const ancestors = findMentionAncestors(parsed.root, id)
    let best = null
    let bestFitness = null
    for(let i = 0; i < ancestors.length; i++){
        const fitness = Math.abs(getAllText(ancestors[i]).length - 80)
        if(!best || fitness < bestFitness){
            best = ancestors[i]
            bestFitness = fitness
        }
    }
    return getAllText(best)
}


const EntityMentionInCommentSection = ({parentContentId, entity, mentioningContentId}: {parentContentId: string, entity: EntityProps, mentioningContentId: string}) => {
    const mentioningContent = useContent(mentioningContentId)
    const parentContent = useContent(parentContentId)
    if(mentioningContent.isLoading) return <LoadingSpinner/>
    if(parentContent.isLoading) return <LoadingSpinner/>
    
    const fragment = findFragment(mentioningContent.content.text, parentContent.content.parentEntityId)

    return <Link className="" href={"/articulo/"+entity.id}>
        <div className="content-container px-2 py-4 w-full flex flex-col">
            <div>
                Mencionado en <span className="content font-bold">{entity.name}</span>.
            </div>
            <div className="content">
                <blockquote>
                    {fragment}
                </blockquote>
            </div>
        </div>
    </Link>
}


const EntityEditInFeed = ({entity, content, version}: {content: ContentProps, entity: EntityProps, version: number}) => {
    const name = <Link href={"/articulo/"+entity.id+"/"+version} className="content">{entity.name}</Link>

    let text = null
    if(version == 0){
        text = <>Creó el artículo {name}</>
    } else if(entity.versions[version].categories != entity.versions[version].categories){
        text = <>Modificó las categorías de {name}</>
    } else {
        text = <>Modificó {name} (<ChangesCounter id1={entity.versions[version].id} id2={entity.versions[version-1].id}/> caracteres)</>
    }
    return <div className="content-container">
        <ContentTopRow content={content} icon={<></>}/>
        <div className="link px-4 py-4">{text}</div>
    </div>
}

export default EntityComponent