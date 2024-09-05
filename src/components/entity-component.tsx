"use client"
import React from "react"
import { ContentProps, EntityProps } from "src/app/lib/definitions";
import WikiEditor from "./editor/wiki-editor";
import { useEntity } from "src/app/hooks/entities";
import LoadingSpinner from "./loading-spinner";
import { EntitySearchResult } from "./entity-search-result";
import Link from "next/link";
import { useContent } from "src/app/hooks/contents";
import { getAllText } from "./diff";


type EntityComponentProps = {
    contentId: string
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
    contentId,
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
    const version = getVersionInEntity(contentId, entity.entity)

    if(parentContentId){
        const version = getVersionInEntity(contentId, entity.entity)
        if(version != entity.entity.versions.length-1){
            return <></>
        } else {
            return <EntityMentionInCommentSection
                entity={entity.entity}
                mentioningContentId={contentId}
                parentContentId={parentContentId}
            />
        }
    } else {
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

export default EntityComponent