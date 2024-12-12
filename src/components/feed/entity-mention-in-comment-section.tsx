"use client"
import {TopicProps} from "../../app/lib/definitions";


const EntityMentionInCommentSection = ({parentContentId, topic, mentioningContentId}: {parentContentId: string, topic: TopicProps, mentioningContentId: string}) => {
    return <div>Sin reimplementar</div>
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