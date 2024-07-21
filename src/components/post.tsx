import HtmlContent from "@/components/editor/ckeditor-html-content";
import { splitPost } from "@/components/utils";
import Link from "next/link";
import { DateComponent } from "@/components/date";

export const Post = ({content}) => {
    const split = splitPost(content)
    const title = "<h1>"+split.title+"</h1>"
    return <div className="bg-white">
        <HtmlContent content={title}/>
        <div className="flex justify-between editor-container">
            <div className="py-2">Por <Link href={"/perfil/"+content.authorId}>{content.author.name}</Link></div>
            <DateComponent date={content.createdAt}/>
        </div>
        <HtmlContent content={split.text}/>
        <hr/>
    </div>
}