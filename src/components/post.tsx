import { Authorship } from "./content";
import ReadOnlyEditor from "./editor/read-only-editor";
import { LikeCounter } from "./like-counter";
import { TextViewsCounter } from "./views-counter";
import { ActivePraiseIcon, InactivePraiseIcon } from "./icons";
import { DateSince } from "./date";
import { decompress } from "./compression";
import { CommentProps } from "../app/lib/definitions";

export const Post: React.FC<{
    content: {
        title?: string
        createdAt: Date | string
        author: {id: string, name: string}
        uniqueViewsCount: number
        parentEntityId?: string
        reactions?: {id: string}[]
        _count: {
            reactions: number
        }
        id: string
        compressedText?: string
        type: string
        isContentEdited: boolean
        childrenContents: CommentProps[]
    }
}> = ({content}) => {

    return <div className="px-1">

        <div className="text-[var(--text-light)] text-sm mt-1 mb-2">
            Publicación
        </div>
        <div className="">
            <h1 className="sm:text-xl text-lg">{content.title}</h1>
        </div>
        <div className="flex justify-between mt-4">
            <div className="sm:space-x-1 text-sm sm:text-base flex flex-col sm:flex-row">
                <span><Authorship content={content} onlyAuthor={true}/>, <DateSince date={content.createdAt}/>.</span>
                <span className="first-letter:capitalize"><TextViewsCounter content={content}/>.</span>
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