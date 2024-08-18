import { DateSince } from "@/components/date";
import { Authorship } from "./content";
import { ReadOnlyEditor } from "./editor/read-only-editor";
import { ContentProps } from '@/app/lib/definitions';

export const Post: React.FC<{
    content: ContentProps
}> = ({content}) => {

    return <div className="">
        <div className="content">
            <h1>{content.title}</h1>
        </div>
        <div className="flex">
            <span className="mr-1"><Authorship content={content}/></span> · <DateSince date={content.createdAt}/>
        </div>
        <div className="min-h-64 mt-4">
            <ReadOnlyEditor 
                initialData={content.text}
                content={content}
                editorClassName="content"
            />
        </div>
        <hr/>
    </div>
}