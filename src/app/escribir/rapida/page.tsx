"use client"

import PostEditor from "../../../components/editor/post-editor"
import { ThreeColumnsLayout } from "../../../components/three-columns"



const PublicacionRapida: React.FC = () => {
    const center = <PostEditor isFast={true}/>

    return <ThreeColumnsLayout center={center}/>
}

export default PublicacionRapida