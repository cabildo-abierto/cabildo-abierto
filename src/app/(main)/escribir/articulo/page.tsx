import {Metadata} from "next"
import ArticleEditor, {ArticleEditorFromDraft} from "../../../../components/writing/article/article-editor"
import {ArticleEditorFromPublished} from "@/components/writing/article/article-editor-from-published";

export const metadata: Metadata = {
    title: 'Escribir publicación',
    description: 'Escribir una publicación en Cabildo Abierto.'
}


const Page = async ({searchParams}: {searchParams: Promise<{
    i?: string | string[] | null, r?: string | string[] | null}>}) => {
    const {i, r} = await searchParams

    if(typeof i == "string"){
        return <ArticleEditorFromDraft id={i}/>
    } else if(typeof r == "string"){
        return <ArticleEditorFromPublished rkey={r}/>
    } else {
        return <ArticleEditor/>
    }

}

export default Page