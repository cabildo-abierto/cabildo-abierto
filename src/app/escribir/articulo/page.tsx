import {Metadata} from "next"
import PostEditor from "../../../components/editor/article-editor"

export const metadata: Metadata = {
    title: 'Escribir publicación',
    description: 'Escribir una publicación en Cabildo Abierto.'
}


const Publicacion: React.FC = () => {

    return <PostEditor
        isFast={false}
    />
}

export default Publicacion