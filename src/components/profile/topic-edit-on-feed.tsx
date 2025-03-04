"use client"
import {TopicProps} from "../../app/lib/definitions";
import {CustomLink as Link} from "../ui-utils/custom-link";
import {topicUrl} from "../utils/utils";
import {getFullTopicTitle, getTopicTitle} from "../topic/utils";
import {ChangesCounter} from "../topic/changes-counter";

const TopicEditOnFeed = ({entity, content, version}: {
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
    const name = <Link href={topicUrl(entity.id, version)} className="content">{getFullTopicTitle(entity)}</Link>

    let text = null
    if(version == 0){
        text = <>Creó el tema {name}</>
    } else if(entity.versions[version].content.topicVersion.categories != null){
        text = <>Modificó las categorías de {name}</>
    } else {
        text = <>Modificó {name} (<ChangesCounter charsAdded={content.charsAdded} charsDeleted={content.charsDeleted}/> caracteres)</>
    }
    return <div className="">
        {/* TO DO <ContentTopRow content={content} icon={<></>}/>*/}
        <div className="link px-4 py-4">{text}</div>
    </div>
}