import { Metadata } from "next"
import PostEditor from "../../../components/editor/article-editor"
import { ThreeColumnsLayout } from "../../../components/three-columns"

export const metadata: Metadata = {
    title: 'Escribir publicación',
    description: 'Escribir una publicación en Cabildo Abierto.'
}


const Publicacion: React.FC = () => {

    const center = <PostEditor
        isFast={false}
    />

    return <ThreeColumnsLayout 
        border={false}
        center={center}
    />
}

export default Publicacion