import {Metadata} from "next"
import ArticleEditor, {ArticleEditorFromDraft} from "../../../../components/writing/article/article-editor"

export const metadata: Metadata = {
    title: 'Escribir publicación',
    description: 'Escribir una publicación en Cabildo Abierto.'
}


const Publicacion = async ({searchParams}: {searchParams: Promise<{i?: string | string[] | null}>}) => {
    const {i} = await searchParams

    if(typeof i == "string"){
        return <ArticleEditorFromDraft id={i}/>
    } else {
        return <ArticleEditor/>
    }

}

export default Publicacion