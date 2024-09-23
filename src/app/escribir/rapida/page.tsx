import PostEditor from "../../../components/editor/post-editor"
import { ThreeColumnsLayout } from "../../../components/three-columns"
import { Metadata } from "next"


export const metadata: Metadata = {
    title: 'Escribir publicación rápida'
}


const PublicacionRapida: React.FC = () => {
    const center = <PostEditor isFast={true}/>

    return <ThreeColumnsLayout center={center}/>
}

export default PublicacionRapida