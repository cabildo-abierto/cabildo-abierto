import HtmlContent from "@/components/editor/html-content";
import { splitPost } from "@/components/utils";
import Link from "next/link";
import { DateComponent } from "@/components/date";
import { ContentProps } from "@/actions/get-content";

export const Post: React.FC<{content: ContentProps}> = ({content}) => {
    const split = splitPost(content.text)
    const title = split ? "<h1>"+split.title+"</h1>" : "<h1>Error al cargar el título</h1>"
    const text = split ? split.text : content.text

    return <div className="bg-white ck-content">
        <HtmlContent content={title}/>
        <div className="flex justify-between">
            <div className="py-2 blue-links">Por <Link href={"/perfil/"+content.author?.id.slice(1)}>{content.author?.name}</Link></div>
            <DateComponent date={content.createdAt}/>
        </div>
        <div className="min-h-64">
            <HtmlContent content={text}/>
        </div>
        <hr/>
    </div>
}