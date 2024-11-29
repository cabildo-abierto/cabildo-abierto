import { Authorship } from "./content";
import ReadOnlyEditor from "./editor/read-only-editor";
import { LikeCounter } from "./like-counter";
import { TextViewsCounter } from "./views-counter";
import { ActivePraiseIcon, InactivePraiseIcon } from "./icons";
import { DateSince } from "./date";
import { decompress } from "./compression";
import { CommentProps } from "../app/lib/definitions";
import { useUser } from "../app/hooks/user";
import { ContentOptionsButton } from "./content-options-button";
import { ReadingTime } from "./reading-time";
import { ContentType } from "@prisma/client";

export const Post: React.FC<{
    content: {
        title?: string
        createdAt: Date | string
        author: {id: string, handle: string, displayName: string}
        uniqueViewsCount: number
        parentEntityId?: string
        _count: {
            reactions: number
        }
        id: string
        compressedText?: string
        type: ContentType
        isContentEdited: boolean
        childrenContents: CommentProps[]
    }
}> = ({content}) => {
    const {user} = useUser()

    const optionList = ["share"]
    if(user && (content.author.id == user.id || user.editorStatus == "Administrator"))
        optionList.push("edit")

    return <div className="px-1">

        <div className="flex justify-between">
            <div className="text-[var(--text-light)] text-sm mt-1 mb-2">
                Publicación
            </div>
            
            {optionList.length > 0 && <div className="flex">
                <ContentOptionsButton content={content} optionList={optionList}/>
            </div>}
        </div>
        <div className="">
            <h1 className="sm:text-4xl text-lg">{content.title}</h1>
        </div>
        <div className="flex justify-between mt-4">
            <div className="sm:space-x-1 text-sm sm:text-base flex flex-col sm:flex-row sm:items-center">
                <span><Authorship content={content} onlyAuthor={true}/>, <DateSince date={content.createdAt}/>.</span>
                <span className="first-letter:capitalize"><TextViewsCounter content={content}/>.</span>
                <ReadingTime content={content}/>
            </div>
            <div className="flex items-center">
                <LikeCounter
                    content={content}
                    icon1={<ActivePraiseIcon/>} icon2={<InactivePraiseIcon/>}
                    title="Votar hacia arriba, para que lo vean más personas."
                />
            </div>
        </div>
        <div className="min-h-64 mt-4 px-2 sm:px-0">
            <ReadOnlyEditor 
                initialData={decompress(content.compressedText)}
                content={content}
                editorClassName="content sm:text-base text-sm"
            />
        </div>
    </div>
}