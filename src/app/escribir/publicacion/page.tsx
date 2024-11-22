import { Metadata } from "next"
import PostEditor from "../../../components/editor/post-editor"
import { ThreeColumnsLayout } from "../../../components/three-columns"

export const metadata: Metadata = {
    title: 'Escribir publicación',
    description: 'Escribir una publicación en Cabildo Abierto.'
}


const Publicacion: React.FC = () => {

    return <ThreeColumnsLayout center={<PostEditor
        isFast={false}
    />}/>
}

export default Publicacion