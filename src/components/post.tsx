import { Authorship } from "./content";
import ReadOnlyEditor from "./editor/read-only-editor";
import { LikeCounter } from "./like-counter";
import { TextViewsCounter } from "./views-counter";
import { ActivePraiseIcon, InactivePraiseIcon } from "./icons";
import { ContentProps } from "../app/lib/definitions";
import { DateSince } from "./date";
import { decompress } from "./compression";

export const Post: React.FC<{
    content: ContentProps
}> = ({content}) => {

    return <div className="px-1">
        <div className="content">
            <h1 className="sm:text-xl text-lg">{content.title}</h1>
        </div>
        <div className="flex justify-between">
            <div className="sm:space-x-1 text-sm sm:text-base flex flex-col sm:flex-row">
                <span><Authorship content={content}/>, <DateSince date={content.createdAt}/>.</span>
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