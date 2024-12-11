"use client"
import WikiEditor from "./editor/wiki-editor";
import LoadingSpinner from "./loading-spinner";
import { CustomLink as Link } from './custom-link';
import { getAllText } from "./diff";
import { ChangesCounter } from "./changes-counter";
import { articleUrl, cleanText, contentContextClassName, currentVersion, getKeysFromEntity, getVersionInEntity, someKeyInText } from "./utils";
import { decompress } from "./compression";
import { TopicProps } from "../app/lib/definitions";
import {useTopic} from "../hooks/topics";
import {getTopicTitle} from "./topic/utils";


type EntityComponentProps = {
    content: {
        id: string
        compressedText?: string
        charsAdded: number
        charsDeleted: number
        type: string
        diff: string
        title?: string
        parentEntityId?: string
        isContentEdited: boolean
        createdAt: Date
        author: {id: string, handle: string, displayName: string}
        fakeReportsCount: number
        childrenContents: any[]
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
    const topic = useTopic(entityId)
    if(topic.isLoading){
        return <LoadingSpinner/>
    }
    if(!topic.topic){
        return <></>
    }

    const version = getVersionInEntity(content.id, topic.topic)

    if(parentContentId){
        const version = getVersionInEntity(content.id, topic.topic)
        if(version != currentVersion(topic.topic)){
            return <></>
        } else {
            return <EntityMentionInCommentSection
                topic={topic.topic}
                mentioningContentId={content.id}
                parentContentId={parentContentId}
            />
        }
    } else if(isMainPage){
        return <WikiEditor 
            version={version}
            topic={topic.topic}
            showingChanges={showingChanges}
            readOnly={!editing}
            showingAuthors={showingAuthors}
            setEditing={setEditing}
        />
    } else {
        return <EntityEditInFeed
        content={content}
        entity={topic.topic}
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

type EntitySearchKeysProps = {id: string, currentVersion: {synonyms: string[]}}


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


const EntityMentionInCommentSection = ({parentContentId, topic, mentioningContentId}: {parentContentId: string, topic: TopicProps, mentioningContentId: string}) => {
    return <div>
        Sin implementar
    </div>
    /*const mentioningContent = useContent(mentioningContentId)
    const parentContent = useContent(parentContentId)
    if(mentioningContent.isLoading) return <LoadingSpinner/>
    if(parentContent.isLoading) return <LoadingSpinner/>

    const fragment = findFragment(
        decompress(mentioningContent.content.compressedText),
        parentContent.content.parentEntity
    )

    return <div>
        <div className={contentContextClassName}>
            Mención en <Link href={articleUrl(topic.id)} className="content">{getTopicTitle(topic)}</Link>.
        </div>
        <div className="px-2 py-4 w-full">
            <div className="content">
                <blockquote>
                    {fragment}
                </blockquote>
            </div>
        </div>
    </div>*/
}


const EntityEditInFeed = ({entity, content, version}: {
    content: {
        charsAdded: number
        charsDeleted: number
        id: string
        isContentEdited: boolean
        createdAt: Date | string
        type: string
        author: {id: string, handle: string, displayName: string}
        fakeReportsCount: number
        childrenContents: {type: string}[]
    },
    entity: TopicProps,
    version: number}) => {
    const name = <Link href={articleUrl(entity.id, version)} className="content">{getTopicTitle(entity)}</Link>

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