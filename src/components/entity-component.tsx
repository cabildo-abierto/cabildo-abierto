"use client"
import React from "react"
import WikiEditor from "./editor/wiki-editor";
import LoadingSpinner from "./loading-spinner";
import { CustomLink as Link } from './custom-link';
import { getAllText } from "./diff";
import { ChangesCounter } from "./changes-counter";
import { useEntity } from "../app/hooks/entities";
import { useContent } from "../app/hooks/contents";
import { CommentProps, EntityProps } from "../app/lib/definitions";
import { articleUrl, cleanText, contentContextClassName, currentVersion, getKeysFromEntity, getVersionInEntity, someKeyInText } from "./utils";
import { decompress } from "./compression";
import { ContentType } from "@prisma/client";


type EntityComponentProps = {
    content: {
        id: string
        compressedText?: string
        charsAdded: number
        charsDeleted: number
        type: ContentType
        diff: string
        title?: string
        parentEntityId?: string
        isContentEdited: boolean
        createdAt: Date
        author: {id: string, handle: string, displayName: string}
        fakeReportsCount: number
        childrenContents: CommentProps[]
    }
    entityId: string
    showingChanges?: boolean
    editing?: boolean
    showingAuthors?: boolean
    setEditing: (arg0: boolean) => void
    isMainPage?: boolean
    parentContentId?: string
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
        return <></>
    }

    const version = getVersionInEntity(content.id, entity.entity)

    if(parentContentId){
        const version = getVersionInEntity(content.id, entity.entity)
        if(version != currentVersion(entity.entity)){
            return <></>
        } else {
            return <EntityMentionInCommentSection
                entity={entity.entity}
                mentioningContentId={content.id}
                parentContentId={parentContentId}
            />
        }
    } else if(isMainPage){
        return <WikiEditor 
            version={version}
            entity={entity.entity}
            content={content}
            showingChanges={showingChanges}
            readOnly={!editing}
            showingAuthors={showingAuthors}
            setEditing={setEditing}
        />
    } else {
        return <EntityEditInFeed
        content={content}
        entity={entity.entity}
        version={version}/>
    }
    
}


function findMentionNode(node: any, entity: EntitySearchKeysProps){
    if(node.type == "link" || node.type == "autolink"){
        const url: string = node.url
        if(url.includes("/articulo/") && url.split("/articulo/")[1] == entity.id)
            return node
    }

    if(!node.children) {
        const text = cleanText(getAllText(node))
        if(someKeyInText(getKeysFromEntity(entity), text)){
            return node
        } else {
            return null
        }
    }
    for(let i = 0; i < node.children.length; i++){
        const found = findMentionNode(node.children[i], entity)
        if(found) return found
    }
}


function findMentionAncestors(node: any, entity: EntitySearchKeysProps){
    if(!node.children){
        return [node]
    }
    for(let i = 0; i < node.children.length; i++){
        const mentionNode = findMentionNode(node.children[i], entity)
        if(mentionNode){
            return [node, ...findMentionAncestors(node.children[i], entity)]
        }
    }
    return [node]
}

type EntitySearchKeysProps = {id: string, currentVersion: {searchkeys: string[]}}


function findFragment(text: string, entity: EntitySearchKeysProps){
    const parsed = JSON.parse(text)
    const mentionNode = findMentionNode(parsed.root, entity)
    if(!mentionNode){
        return "Parece haber una mención pero no la encontramos"
    }
    const ancestors = findMentionAncestors(parsed.root, entity)
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

    const fragment = findFragment(
        decompress(mentioningContent.content.compressedText),
        parentContent.content.parentEntity
    )

    return <div>
        <div className={contentContextClassName}>
            Mención en <Link href={articleUrl(entity.id)} className="content">{entity.name}</Link>.
        </div>
        <div className="px-2 py-4 w-full">
            <div className="content">
                <blockquote>
                    {fragment}
                </blockquote>
            </div>
        </div>
    </div>
}


const EntityEditInFeed = ({entity, content, version}: {
    content: {
        charsAdded: number
        charsDeleted: number
        id: string
        isContentEdited: boolean
        createdAt: Date | string
        type: ContentType
        author: {id: string, handle: string, displayName: string}
        fakeReportsCount: number
        childrenContents: {type: ContentType}[]
    },
    entity: EntityProps,
    version: number}) => {
    const name = <Link href={articleUrl(entity.id, version)} className="content">{entity.name}</Link>

    let text = null
    if(version == 0){
        text = <>Creó el tema {name}</>
    } else if(entity.versions[version].categories != entity.versions[version].categories){
        text = <>Modificó las categorías de {name}</>
    } else {
        text = <>Modificó {name} (<ChangesCounter charsAdded={content.charsAdded} charsDeleted={content.charsDeleted}/> caracteres)</>
    }
    return <div className="">
        {/* TO DO <ContentTopRow content={content} icon={<></>}/>*/}
        <div className="link px-4 py-4">{text}</div>
    </div>
}

export default EntityComponent