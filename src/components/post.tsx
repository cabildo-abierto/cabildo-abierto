import { DateSince } from "src/components/date";
import { Authorship } from "./content";
import ReadOnlyEditor from "./editor/read-only-editor";
import { ContentProps } from 'src/app/lib/definitions';
import { LikeCounter } from "./like-counter";
import { TextViewsCounter, ViewsCounter } from "./views-counter";
import { ActivePraiseIcon, InactivePraiseIcon } from "./icons";

export const Post: React.FC<{
    content: ContentProps
}> = ({content}) => {

    return <div className="">
        <div className="content">
            <h1>{content.title}</h1>
        </div>
        <div className="flex justify-between">
            <div className="flex items-center space-x-1">
                <span className="mr-1"><Authorship content={content}/></span><span>·</span><span><DateSince date={content.createdAt}/></span><span>·</span><TextViewsCounter contentId={content.id}/>
            </div>
            <div className="flex items-center">
                <div className="border rounded p-1 flex flex-col items-center">
                    <span className="px-1 flex items-center text-sm text-[var(--text-light)]">Te sirvió?</span>
                    <LikeCounter
                        contentId={content.id}
                        icon1={<ActivePraiseIcon/>} icon2={<InactivePraiseIcon/>}
                    />
                </div>
            </div>
        </div>
        <div className="min-h-64 mt-4">
            <ReadOnlyEditor 
                initialData={content.text}
                content={content}
                editorClassName="content"
            />
        </div>
    </div>
}