import {Metadata} from "next"
import ArticleEditor from "../../../../components/writing/article/article-editor"

export const metadata: Metadata = {
    title: 'Escribir publicación',
    description: 'Escribir una publicación en Cabildo Abierto.'
}


const Publicacion = () => {

    return <ArticleEditor/>
}

export default Publicacion