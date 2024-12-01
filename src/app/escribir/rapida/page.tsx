import PostEditor from "../../../components/editor/article-editor"
import { ThreeColumnsLayout } from "../../../components/three-columns"
import { Metadata } from "next"


export const metadata: Metadata = {
    title: 'Escribir publicación rápida',
    description: 'Escribir una publicación rápida en Cabildo Abierto.'
}


const PublicacionRapida: React.FC = () => {
    const center = <PostEditor isFast={true}/>

    return <ThreeColumnsLayout center={center}/>
}

export default PublicacionRapida