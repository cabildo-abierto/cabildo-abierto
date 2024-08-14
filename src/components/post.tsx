import HtmlContent from "@/components/editor/html-content";
import { splitPost } from "@/components/utils";
import Link from "next/link";
import { DateComponent } from "@/components/date";
import { ContentProps } from "@/actions/get-content";
import { Authorship } from "./content";
import { UserProps } from "@/actions/get-user";

export const Post: React.FC<{content: ContentProps, user: UserProps | null}> = ({content, user}) => {
    const split = splitPost(content.text)
    const title = split ? "<h1>"+split.title+"</h1>" : "<h1>Error al cargar el título</h1>"
    const text = split ? split.text : content.text

    return <div className="">
        <HtmlContent content={title} user={user}/>
        <div className="flex justify-between">
            <Authorship content={content}/>
            <DateComponent date={content.createdAt}/>
        </div>
        <div className="min-h-64">
            <HtmlContent content={text} user={user}/>
        </div>
        <hr/>
    </div>
}