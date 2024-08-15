import HtmlContent from "@/components/editor/html-content";
import { splitPost } from "@/components/utils";
import Link from "next/link";
import { DateComponent } from "@/components/date";
import { ContentProps } from "@/actions/get-content";
import { Authorship } from "./content";
import { UserProps } from "@/actions/get-user";

export const Post: React.FC<{content: ContentProps, user: UserProps | null}> = ({content, user}) => {
    const [title, text] = JSON.parse(content.text)

    return <div className="">
        <div className="content">
            <h1>{title}</h1>
        </div>
        <div className="flex justify-between">
            <Authorship content={content}/>
            <DateComponent date={content.createdAt}/>
        </div>
        <div className="min-h-64">
            <HtmlContent content={JSON.stringify(text)} user={user}/>
        </div>
        <hr/>
    </div>
}