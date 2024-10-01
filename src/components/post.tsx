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

    return <div className="">
        <div className="content">
            <h1>{content.title}</h1>
        </div>
        <div className="flex justify-between">
            <div className="flex items-center space-x-1">
                <span className="mr-1"><Authorship content={content}/></span><span>·</span><span><DateSince date={content.createdAt}/></span><span>·</span><TextViewsCounter content={content}/>
            </div>
            <div className="flex items-center">
                <LikeCounter
                    content={content}
                    icon1={<ActivePraiseIcon/>} icon2={<InactivePraiseIcon/>}
                />
            </div>
        </div>
        <div className="min-h-64 mt-4">
            <ReadOnlyEditor 
                initialData={decompress(content.compressedText)}
                content={content}
                editorClassName="content"
            />
        </div>
    </div>
}