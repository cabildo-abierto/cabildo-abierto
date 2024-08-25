import { DateSince } from "@/components/date";
import { Authorship, LikeAndCommentCounter } from "./content";
import { ReadOnlyEditor } from "./editor/read-only-editor";
import { ContentProps } from '@/app/lib/definitions';
import { LikeCounter } from "./like-counter";
import { ViewsCounter } from "./views-counter";

export const Post: React.FC<{
    content: ContentProps
}> = ({content}) => {

    return <div className="">
        <div className="content">
            <h1>{content.title}</h1>
        </div>
        <div className="flex justify-between">
            <div className="flex">
                <span className="mr-1"><Authorship content={content}/></span> · <DateSince date={content.createdAt}/>
            </div>
            <div className="flex">
                <ViewsCounter contentId={content.id}/>
                <LikeCounter content={content} disabled={false}/>
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