"use client"

import { ThreeColumnsLayout } from "src/components/three-columns";
import PostEditor from 'src/components/editor/post-editor';


const PublicacionRapida: React.FC = () => {
    const center = <PostEditor isFast={true}/>

    return <ThreeColumnsLayout center={center}/>
}

export default PublicacionRapida