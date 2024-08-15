import { DateSince } from "@/components/date";
import { ContentProps } from "@/actions/get-content";
import { Authorship } from "./content";
import { UserProps } from "@/actions/get-user";
import { ReadOnlyEditor } from "./editor/read-only-editor";

export const Post: React.FC<{
    content: ContentProps, 
    user?: UserProps,
    contents: Record<string, ContentProps>
}> = ({content, user, contents}) => {

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
                enableComments={user !== null}
                user={user}
                content={content}
                editorClassName="content"
                contents={contents}
            />
        </div>
        <hr/>
    </div>
}