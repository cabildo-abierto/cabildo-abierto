import PostEditor from "../../../components/editor/article-editor"
import { ThreeColumnsLayout } from "../../../components/three-columns"
import { Metadata } from "next"
import {NotFoundPage} from "../../../components/not-found-page";


export const metadata: Metadata = {
    title: 'Escribir publicación rápida',
    description: 'Escribir una publicación rápida en Cabildo Abierto.'
}


const PublicacionRapida: React.FC = () => {
    return <NotFoundPage/>
}

export default PublicacionRapida